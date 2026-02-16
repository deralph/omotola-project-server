const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Material = require('../models/Material');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateQuizQuestionsFromText } = require('../services/quizGenerator');

exports.listQuizzes = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const filter = { user: req.user._id, ...(req.query.subject ? { subject: req.query.subject } : {}) };
  const [quizzes, total] = await Promise.all([Quiz.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Quiz.countDocuments(filter)]);
  res.json({ quizzes, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.generateQuiz = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.body.materialId, user: req.user._id });
  if (!material) throw new ApiError(404, 'Material not found');
  const questions = await generateQuizQuestionsFromText(material.extractedText || material.title, req.body.difficulty, req.body.numberOfQuestions || 5);
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0);
  const quiz = await Quiz.create({ user: req.user._id, material: material._id, title: `${material.title} Quiz`, subject: material.subject, difficulty: req.body.difficulty || 'medium', questions, totalPoints, timeLimit: 15 });
  res.status(201).json({ quiz });
});

exports.getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  res.json({ quiz });
});

exports.submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  const answers = (req.body.answers || []).map((answer) => {
    const question = quiz.questions[answer.questionIndex];
    const isCorrect = question && String(question.correctAnswer).trim().toLowerCase() === String(answer.userAnswer).trim().toLowerCase();
    return { questionIndex: answer.questionIndex, userAnswer: answer.userAnswer, isCorrect, pointsEarned: isCorrect ? (question.points || 1) : 0 };
  });
  const score = answers.reduce((a, b) => a + b.pointsEarned, 0);
  const percentage = quiz.totalPoints ? (score / quiz.totalPoints) * 100 : 0;
  const attempt = await QuizAttempt.create({ user: req.user._id, quiz: quiz._id, answers, score, percentage, totalPoints: quiz.totalPoints, timeSpent: req.body.timeSpent || 0, completedAt: new Date() });
  res.json({ score, percentage, correctAnswers: answers.filter((a) => a.isCorrect).length, results: attempt.answers });
});

exports.getResults = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id, quiz: req.params.id }).lean();
  const avgScore = attempts.length ? attempts.reduce((s, x) => s + x.percentage, 0) / attempts.length : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  res.json({ attempts, avgScore, bestScore });
});

exports.deleteQuiz = asyncHandler(async (req, res) => {
  await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  await QuizAttempt.deleteMany({ quiz: req.params.id, user: req.user._id });
  res.json({ message: 'Quiz deleted' });
});
