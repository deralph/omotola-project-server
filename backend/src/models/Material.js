const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  subject: String,
  fileType: { type: String, enum: ['pdf', 'docx', 'txt', 'image'] },
  fileUrl: { type: String, required: true },
  fileName: String,
  fileSize: Number,
  extractedText: String,
  aiSummary: String,
  keyTopics: [String],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  processingError: String,
  uploadedAt: { type: Date, default: Date.now },
  lastAccessedAt: Date
});

module.exports = mongoose.model('Material', materialSchema);
