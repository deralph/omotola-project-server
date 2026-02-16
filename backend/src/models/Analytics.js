const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventType: { type: String, enum: ['study_session', 'quiz_completed', 'material_uploaded', 'chat_interaction'] },
  eventData: mongoose.Schema.Types.Mixed,
  context: { device: String, connectivity: String, timeOfDay: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
