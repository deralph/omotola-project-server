const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  deviceInfo: { type: { type: String, enum: ['mobile', 'tablet', 'desktop'] }, os: String, browser: String },
  connectivity: { type: { type: String, enum: ['wifi', '4g', '3g', '2g', 'offline'] }, speed: String, isLowBandwidth: Boolean },
  location: { city: String, country: String, timezone: String },
  currentActivity: { type: String, enum: ['studying', 'quiz', 'chatting', 'browsing'] },
  sessionStart: Date,
  lastActive: Date,
  studySession: { startTime: Date, endTime: Date, duration: Number, materialsAccessed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }] }
});

module.exports = mongoose.model('Context', contextSchema);
