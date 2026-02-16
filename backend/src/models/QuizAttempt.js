const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ questionIndex: Number, userAnswer: String, isCorrect: Boolean, pointsEarned: Number }],
  score: Number,
  percentage: Number,
  totalPoints: Number,
  timeSpent: Number,
  completedAt: Date
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
