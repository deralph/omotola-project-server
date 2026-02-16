const Analytics = require('../models/Analytics');
const Context = require('../models/Context');
const asyncHandler = require('../utils/asyncHandler');
const { buildRecommendations } = require('../services/recommendationEngine');

exports.getRecommendations = asyncHandler(async (req, res) => {
  const [context, quizStats] = await Promise.all([
    Context.findOne({ user: req.user._id }).lean(),
    Analytics.aggregate([{ $match: { user: req.user._id, eventType: 'quiz_completed' } }, { $group: { _id: null, avgScore: { $avg: '$eventData.percentage' } } }])
  ]);
  res.json({ recommendations: buildRecommendations(context, quizStats[0] || {}) });
});
exports.feedback = asyncHandler(async (_req, res) => res.json({ message: 'Feedback recorded' }));
