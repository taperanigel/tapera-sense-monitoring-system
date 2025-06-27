const mongoose = require("mongoose")

const lcdConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mode: {
    type: Number,
    enum: [0, 1, 2], // 0 = temp/humidity, 1 = IP address, 2 = custom message
    default: 0,
  },
  message: {
    type: String,
    default: "",
  },
  backlight: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
lcdConfigSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("LcdConfig", lcdConfigSchema)
