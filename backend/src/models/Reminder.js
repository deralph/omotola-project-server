const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  scheduledTime: { type: Date, required: true, index: true },
  recurrence: { type: String, enum: ['once', 'daily', 'weekly', 'custom'], default: 'once' },
  customRecurrence: { interval: Number, unit: { type: String, enum: ['days', 'weeks', 'months'] } },
  contextConditions: {
    deviceType: { type: String, enum: ['mobile', 'desktop', 'any'], default: 'any' },
    connectivityType: { type: String, enum: ['wifi', 'mobile_data', 'any'], default: 'any' },
    locationRequired: String
  },
  isActive: { type: Boolean, default: true },
  lastTriggered: Date
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Reminder', reminderSchema);
