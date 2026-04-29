const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress/stats
router.get('/stats', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  const totalMinutes = db.prepare(
    'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE user_id = ?'
  ).get(userId).total;

  const materialCount = db.prepare(
    'SELECT COUNT(*) as count FROM materials WHERE user_id = ?'
  ).get(userId).count;

  const quizCount = db.prepare(
    'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?'
  ).get(userId).count;

  const avgScore = db.prepare(
    'SELECT COALESCE(ROUND(AVG(percentage), 0), 0) as avg FROM quiz_attempts WHERE user_id = ?'
  ).get(userId).avg;

  const user = db.prepare('SELECT study_streak, level, points FROM users WHERE id = ?').get(userId);

  const studyBySubject = db.prepare(`
    SELECT subject, ROUND(SUM(duration_minutes) / 60.0, 1) as hours
    FROM study_sessions WHERE user_id = ? AND date >= date('now', '-30 days')
    GROUP BY subject ORDER BY hours DESC LIMIT 8
  `).all(userId);

  const weeklyPerformance = db.prepare(`
    SELECT
      'W' || (CAST((julianday('now') - julianday(completed_at)) / 7 AS INTEGER) + 1) as week,
      ROUND(AVG(percentage), 0) as score,
      MIN(completed_at) as period_start
    FROM quiz_attempts
    WHERE user_id = ? AND completed_at >= datetime('now', '-42 days')
    GROUP BY week
    ORDER BY period_start ASC
  `).all(userId);

  const subjectBreakdown = db.prepare(`
    SELECT
      ss.subject,
      ROUND(SUM(ss.duration_minutes) / 60.0, 1) as hours,
      COALESCE((
        SELECT ROUND(AVG(qa2.percentage), 0) FROM quiz_attempts qa2
        JOIN quizzes q2 ON q2.id = qa2.quiz_id
        WHERE qa2.user_id = ss.user_id AND q2.subject = ss.subject
      ), 0) as avg_score,
      (SELECT COUNT(*) FROM quiz_attempts qa3
        JOIN quizzes q3 ON q3.id = qa3.quiz_id
        WHERE qa3.user_id = ss.user_id AND q3.subject = ss.subject) as quiz_count
    FROM study_sessions ss
    WHERE ss.user_id = ?
    GROUP BY ss.subject
    ORDER BY hours DESC
  `).all(userId);

  const radarData = db.prepare(`
    SELECT q.subject, ROUND(AVG(qa.percentage), 0) as score
    FROM quiz_attempts qa
    JOIN quizzes q ON q.id = qa.quiz_id
    WHERE qa.user_id = ?
    GROUP BY q.subject
  `).all(userId);

  const recentActivity = db.prepare(`
    SELECT 'quiz' as type, 'Completed a quiz — ' || q.title as text, qa.completed_at as time
    FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id WHERE qa.user_id = ?
    UNION ALL
    SELECT 'upload' as type, 'Uploaded "' || title || '"' as text, created_at as time
    FROM materials WHERE user_id = ?
    UNION ALL
    SELECT 'study' as type, 'Studied ' || subject || ' for ' || duration_minutes || ' min' as text, created_at as time
    FROM study_sessions WHERE user_id = ?
    ORDER BY time DESC LIMIT 10
  `).all(userId, userId, userId);

  res.json({
    stats: {
      studyHours: (totalMinutes / 60).toFixed(1),
      materialCount,
      quizCount,
      avgScore: Math.round(avgScore),
      studyStreak: user.study_streak,
      level: user.level,
      points: user.points,
    },
    studyBySubject,
    weeklyPerformance,
    subjectBreakdown,
    radarData,
    recentActivity,
  });
});

// POST /api/progress/session
router.post('/session', authenticateToken, (req, res) => {
  try {
    const { subject, durationMinutes, activityType } = req.body;
    const db = getDB();
    const sessionId = uuidv4();

    db.prepare(
      'INSERT INTO study_sessions (id, user_id, subject, duration_minutes, activity_type) VALUES (?, ?, ?, ?, ?)'
    ).run(sessionId, req.user.id, subject || 'General', durationMinutes || 0, activityType || 'study');

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const user = db.prepare('SELECT study_streak, last_study_date FROM users WHERE id = ?').get(req.user.id);

    if (user.last_study_date !== today) {
      const newStreak = user.last_study_date === yesterday ? user.study_streak + 1 : 1;
      db.prepare('UPDATE users SET study_streak = ?, last_study_date = ?, points = points + 5 WHERE id = ?')
        .run(newStreak, today, req.user.id);
    }

    res.status(201).json({ message: 'Study session logged', sessionId });
  } catch (err) {
    console.error('Log session error:', err);
    res.status(500).json({ error: 'Failed to log study session' });
  }
});

module.exports = router;
