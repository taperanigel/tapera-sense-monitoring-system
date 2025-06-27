const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords...")
    console.log("Candidate password length:", candidatePassword ? candidatePassword.length : 0)
    console.log("Stored password hash exists:", !!this.password)
    const result = await bcrypt.compare(candidatePassword, this.password)
    console.log("bcrypt.compare result:", result)
    return result
  } catch (error) {
    console.error("Password comparison error in model:", error)
    throw error
  }
}

module.exports = mongoose.model("User", userSchema)
