const Analytics = require('../models/Analytics');
const QuizAttempt = require('../models/QuizAttempt');
const Material = require('../models/Material');
const asyncHandler = require('../utils/asyncHandler');

exports.trackEvent = asyncHandler(async (req, res) => {
  await Analytics.create({ user: req.user._id, eventType: req.body.eventType, eventData: req.body.eventData, context: req.body.context });
  res.status(201).json({ message: 'Event tracked' });
});

exports.progress = asyncHandler(async (req, res) => {
  const quizzesCompleted = await QuizAttempt.countDocuments({ user: req.user._id });
  const materialsUploaded = await Material.countDocuments({ user: req.user._id });
  const avg = await QuizAttempt.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: null, avgScore: { $avg: '$percentage' } } }]);
  res.json({ studyTime: 0, materialsUploaded, quizzesCompleted, avgScore: avg[0]?.avgScore || 0, timeframe: req.query.timeframe || 'month' });
});
exports.performance = asyncHandler(async (_req, res) => res.json({ subjectWisePerformance: [], trends: [], strengths: [], weaknesses: [] }));
exports.studyTime = asyncHandler(async (req, res) => res.json({ studyTimeData: [], groupBy: req.query.groupBy || 'day' }));
exports.strengthsWeaknesses = asyncHandler(async (_req, res) => res.json({ strengths: [], weaknesses: [], recommendations: [] }));
