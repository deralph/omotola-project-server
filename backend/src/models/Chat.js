const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
    referencedMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }]
  }],
  contextMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
