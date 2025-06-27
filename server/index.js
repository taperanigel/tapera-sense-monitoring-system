require('dotenv').config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load models
const Reading = require("./models/reading");
const User = require("./models/user");
const LcdConfig = require("./models/lcd-config");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configure CORS for specific origin
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Connect to MQTT broker
const mqttClient = mqtt.connect(process.env.MQTT_URI, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  reconnectionPeriod: 5000,
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe("sensors/dht22/readings");
});

mqttClient.on("error", (error) => {
  console.error("MQTT connection error:", error);
});

// Handle MQTT messages
mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === "sensors/dht22/readings") {
      console.log("Received sensor data:", data);

      // Create a new reading document
      const reading = new Reading({
        deviceId: data.device_id,
        temperature: data.temperature,
        humidity: data.humidity,
        timestamp: new Date(),
      });

      // Save to database
      await reading.save();

      // Emit to all connected clients
      io.emit("newReading", reading);
    }
  } catch (error) {
    console.error("Error processing MQTT message:", error);
  }
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// API Routes

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create first user as admin
    const isFirstUser = (await User.countDocuments({})) === 0;

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: isFirstUser ? "admin" : "user",
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Return user info (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Return user info (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// User management routes (admin only)
app.get("/api/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/users", authenticate, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || "user",
    });

    await user.save();

    // Return user info (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LCD Configuration routes
app.get("/api/lcd-config", authenticate, async (req, res) => {
  try {
    // Find the latest LCD config or create a default one
    let config = await LcdConfig.findOne().sort({ updatedAt: -1 });

    if (!config) {
      config = new LcdConfig({
        mode: 0,
        message: "Welcome!",
        backlight: true,
        userId: req.user._id,
      });
      await config.save();
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/lcd-config", authenticate, async (req, res) => {
  try {
    const { mode, message, backlight } = req.body;

    // Create new LCD config
    const config = new LcdConfig({
      mode,
      message,
      backlight,
      userId: req.user._id,
    });

    await config.save();

    // Publish to MQTT to update LCD
    mqttClient.publish(
      "sensors/dht22/lcd",
      JSON.stringify({
        mode,
        message,
        backlight,
      })
    );

    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sensor data routes
app.get("/api/readings/latest", authenticate, async (req, res) => {
  try {
    const reading = await Reading.findOne().sort({ timestamp: -1 });
    res.json(reading);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/readings/history", authenticate, async (req, res) => {
  try {
    const { timeframe } = req.query;
    const startDate = new Date();

    // Calculate start date based on timeframe
    if (timeframe === "24h") {
      startDate.setHours(startDate.getHours() - 24);
    } else if (timeframe === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setHours(startDate.getHours() - 24); // Default to 24h
    }

    // Get readings since start date, with appropriate aggregation
    let interval, groupBy;
    if (timeframe === "24h") {
      interval = 30 * 60 * 1000; // 30 minutes in milliseconds
      groupBy = { $dateToString: { format: "%H:%M", date: "$timestamp" } };
    } else if (timeframe === "7d") {
      interval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      groupBy = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" } };
    } else {
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
    }

    const readings = await Reading.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: groupBy,
          temperature: { $avg: "$temperature" },
          humidity: { $avg: "$humidity" },
          timestamp: { $first: "$timestamp" },
        },
      },
      { $sort: { timestamp: 1 } },
    ]);

    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report generation routes
app.post("/api/reports/generate", authenticate, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;

    // Validate inputs
    if (!type || !startDate) {
      return res.status(400).json({ message: "Type and startDate are required" });
    }

    const start = new Date(startDate);
    let end = endDate ? new Date(endDate) : new Date();

    // For daily reports, set end to end of the day if not provided
    if (type === "daily" && !endDate) {
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    }

    // Query data based on report type
    let readings;
    let reportTitle;
    let reportFilename;

    switch (type) {
      case "daily":
        readings = await Reading.find({
          timestamp: { $gte: start, $lte: end },
        }).sort({ timestamp: 1 });
        reportTitle = `Daily Report - ${start.toLocaleDateString()}`;
        reportFilename = `daily_report_${start.toISOString().split("T")[0]}.txt`;
        break;

      case "weekly":
        readings = await Reading.find({
          timestamp: { $gte: start, $lte: end },
        }).sort({ timestamp: 1 });
        reportTitle = `Weekly Report - ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
        reportFilename = `weekly_report_${start.toISOString().split("T")[0]}.txt`;
        break;

      case "monthly":
        readings = await Reading.find({
          timestamp: { $gte: start, $lte: end },
        }).sort({ timestamp: 1 });
        reportTitle = `Monthly Report - ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
        reportFilename = `monthly_report_${start.toISOString().split("T")[0]}.txt`;
        break;

      case "yearly":
        readings = await Reading.find({
          timestamp: { $gte: start, $lte: end },
        }).sort({ timestamp: 1 });
        reportTitle = `Yearly Report - ${start.getFullYear()}`;
        reportFilename = `yearly_report_${start.getFullYear()}.txt`;
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    // Generate report content
    let reportContent = `TiNoq Sense - ${reportTitle}\n`;
    reportContent += `Generated on: ${new Date().toLocaleString()}\n`;
    reportContent += `Report period: ${start.toLocaleString()} to ${end.toLocaleString()}\n`;
    reportContent += `Generated by: ${req.user.username}\n\n`;

    // Add statistics
    if (readings.length > 0) {
      const temperatures = readings.map((r) => r.temperature);
      const humidities = readings.map((r) => r.humidity);

      const tempMin = Math.min(...temperatures).toFixed(1);
      const tempMax = Math.max(...temperatures).toFixed(1);
      const tempAvg = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1);

      const humMin = Math.min(...humidities).toFixed(1);
      const humMax = Math.max(...humidities).toFixed(1);
      const humAvg = (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1);

      reportContent += `SUMMARY STATISTICS\n`;
      reportContent += `------------------\n`;
      reportContent += `Temperature (°C):\n`;
      reportContent += `  Minimum: ${tempMin}\n`;
      reportContent += `  Maximum: ${tempMax}\n`;
      reportContent += `  Average: ${tempAvg}\n\n`;
      reportContent += `Humidity (%):\n`;
      reportContent += `  Minimum: ${humMin}\n`;
      reportContent += `  Maximum: ${humMax}\n`;
      reportContent += `  Average: ${humAvg}\n\n`;

      // Add readings
      reportContent += `DETAILED READINGS\n`;
      reportContent += `------------------\n`;
      reportContent += `Timestamp            | Temperature (°C) | Humidity (%)\n`;
      reportContent += `---------------------|-----------------|-------------\n`;

      readings.forEach((reading) => {
        const timestamp = new Date(reading.timestamp).toLocaleString();
        reportContent += `${timestamp.padEnd(21)} | ${reading.temperature.toFixed(1).padEnd(16)} | ${reading.humidity.toFixed(1)}\n`;
      });
    } else {
      reportContent += `No readings found for the selected period.\n`;
    }

    // Save report to file
    const reportPath = path.join(reportsDir, reportFilename);
    fs.writeFileSync(reportPath, reportContent);

    // Send report content as response
    res.setHeader("Content-Type", "text/plain");
    res.send(reportContent);
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create initial admin user if none exists
const createInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      const admin = new User({
        username: "admin",
        email: "admin@example.com",
        password: "admin123", // This will be hashed by the pre-save hook
        role: "admin",
      });

      await admin.save();
      console.log("Initial admin user created");
    }
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
};

createInitialAdmin();