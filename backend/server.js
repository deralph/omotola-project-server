require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { initializeDatabase } = require('./src/db/database');

const authRoutes = require('./src/routes/auth');
const materialsRoutes = require('./src/routes/materials');
const chatRoutes = require('./src/routes/chat');
const quizzesRoutes = require('./src/routes/quizzes');
const progressRoutes = require('./src/routes/progress');
const remindersRoutes = require('./src/routes/reminders');
const resourcesRoutes = require('./src/routes/resources');
const leaderboardRoutes = require('./src/routes/leaderboard');
const studyPlanRoutes = require('./src/routes/studyplan');
const summarizerRoutes = require('./src/routes/summarizer');
const recommendationsRoutes = require('./src/routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

initializeDatabase();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many AI requests, please wait a moment.' },
});

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/study-plan', aiLimiter, studyPlanRoutes);
app.use('/api/summarizer', aiLimiter, summarizerRoutes);
app.use('/api/recommendations', aiLimiter, recommendationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Study Mate AI', timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Study Mate AI Server running on http://localhost:${PORT}`);
});
