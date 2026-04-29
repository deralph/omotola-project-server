const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { generateStudyPlan } = require('../services/ai');

const router = express.Router();

// GET /api/study-plan
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const plans = db.prepare(
    'SELECT id, exam_date, subject, created_at FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(req.user.id);
  res.json({ plans });
});

// GET /api/study-plan/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const plan = db.prepare('SELECT * FROM study_plans WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan: { ...plan, plan: JSON.parse(plan.plan || '[]') } });
});

// POST /api/study-plan/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { examDate, subject } = req.body;
    if (!examDate) return res.status(400).json({ error: 'Exam date is required' });

    const db = getDB();

    const weakAreas = db.prepare(`
      SELECT q.title, qa.percentage FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.user_id = ? AND qa.percentage < 70
      ORDER BY qa.completed_at DESC LIMIT 5
    `).all(req.user.id).map(a => a.title);

    const user = db.prepare('SELECT level FROM users WHERE id = ?').get(req.user.id);
    const planData = await generateStudyPlan(examDate, subject, user.level, weakAreas);

    const planId = uuidv4();
    db.prepare(
      'INSERT INTO study_plans (id, user_id, exam_date, subject, plan) VALUES (?, ?, ?, ?, ?)'
    ).run(planId, req.user.id, examDate, subject || '', JSON.stringify(planData));

    res.status(201).json({ plan: { id: planId, examDate, subject, plan: planData } });
  } catch (err) {
    console.error('Study plan error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate study plan' });
  }
});

module.exports = router;
