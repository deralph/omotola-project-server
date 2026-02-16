const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['video', 'article', 'pdf', 'external_link'] },
  url: { type: String, required: true },
  subject: String,
  difficulty: String,
  duration: Number,
  rating: Number,
  tags: [String],
  isVerified: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Resource', resourceSchema);
