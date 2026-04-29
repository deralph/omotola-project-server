const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { generateRecommendations } = require('../services/ai');

const router = express.Router();

// GET /api/recommendations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const recent = db.prepare(`
      SELECT * FROM recommendations
      WHERE user_id = ? AND created_at >= datetime('now', '-24 hours')
      ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC
      LIMIT 6
    `).all(userId);

    if (recent.length > 0) {
      return res.json({ recommendations: recent.map(r => ({ ...r, completed: Boolean(r.completed) })) });
    }

    const quizAttempts = db.prepare(`
      SELECT qa.percentage, q.title as quiz_title, q.subject
      FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.user_id = ? ORDER BY qa.completed_at DESC LIMIT 10
    `).all(userId);

    const materials = db.prepare('SELECT title, subject FROM materials WHERE user_id = ? LIMIT 10').all(userId);
    const generated = await generateRecommendations(quizAttempts, materials, req.user.department);

    db.prepare('DELETE FROM recommendations WHERE user_id = ?').run(userId);

    const stmt = db.prepare(
      'INSERT INTO recommendations (id, user_id, topic, subject, estimated_time, difficulty, reason, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    generated.forEach(r => {
      stmt.run(uuidv4(), userId, r.topic, r.subject || '', r.estimatedTime || '30 min', r.difficulty || 'Medium', r.reason || '', r.priority || 'medium');
    });

    const saved = db.prepare(`
      SELECT * FROM recommendations WHERE user_id = ?
      ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC
      LIMIT 6
    `).all(userId);

    res.json({ recommendations: saved.map(r => ({ ...r, completed: Boolean(r.completed) })) });
  } catch (err) {
    console.error('Recommendations error:', err);
    const db = getDB();
    const fallback = db.prepare('SELECT * FROM recommendations WHERE user_id = ? LIMIT 6').all(req.user.id);
    if (fallback.length > 0) {
      return res.json({ recommendations: fallback.map(r => ({ ...r, completed: Boolean(r.completed) })) });
    }
    res.status(500).json({ error: err.message || 'Failed to get recommendations' });
  }
});

// PATCH /api/recommendations/:id/complete
router.patch('/:id/complete', authenticateToken, (req, res) => {
  const db = getDB();
  db.prepare('UPDATE recommendations SET completed = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  db.prepare('UPDATE users SET points = points + 10 WHERE id = ?').run(req.user.id);
  res.json({ message: 'Marked as complete' });
});

module.exports = router;
