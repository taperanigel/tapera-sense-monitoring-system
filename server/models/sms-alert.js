const mongoose = require("mongoose")

const smsAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  temperatureMin: {
    type: Number,
    default: null,
  },
  temperatureMax: {
    type: Number,
    default: null,
  },
  humidityMin: {
    type: Number,
    default: null,
  },
  humidityMax: {
    type: Number,
    default: null,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  lastNotified: {
    type: Date,
    default: null,
  },
  cooldownPeriod: {
    type: Number,
    default: 3600, // Default cooldown of 1 hour (in seconds)
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
smsAlertSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("SmsAlert", smsAlertSchema)
