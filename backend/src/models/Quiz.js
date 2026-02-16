const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  title: { type: String, required: true },
  subject: String,
  difficulty: String,
  questions: [{
    type: { type: String, enum: ['multiple_choice', 'true_false', 'short_answer'] },
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    points: { type: Number, default: 1 }
  }],
  totalPoints: Number,
  timeLimit: Number
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Quiz', quizSchema);
