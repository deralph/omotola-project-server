const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { generateQuiz } = require('../services/ai');

const router = express.Router();

// GET /api/quizzes
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const quizzes = db.prepare(`
    SELECT q.id, q.title, q.subject, q.question_count, q.duration, q.created_at,
      ROUND(MAX(qa.percentage), 0) as best_score,
      COUNT(qa.id) as attempt_count,
      CASE WHEN COUNT(qa.id) > 0 THEN 'completed' ELSE 'available' END as status
    FROM quizzes q
    LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = q.user_id
    WHERE q.user_id = ?
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `).all(req.user.id);
  res.json({ quizzes });
});

// POST /api/quizzes/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { materialId, questionCount = 10 } = req.body;
    if (!materialId) return res.status(400).json({ error: 'materialId is required' });

    const db = getDB();
    const material = db.prepare('SELECT * FROM materials WHERE id = ? AND user_id = ?').get(materialId, req.user.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    if (!material.text_content || material.status !== 'ready') {
      return res.status(400).json({ error: 'Material is still processing or has no text. Please wait.' });
    }

    const questions = await generateQuiz(material.text_content, material.subject || material.title, questionCount);
    const quizId = uuidv4();
    const duration = Math.ceil(questions.length * 1.5);

    db.prepare(
      'INSERT INTO quizzes (id, user_id, material_id, title, subject, question_count, duration, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      quizId, req.user.id, materialId,
      `Quiz: ${material.title}`,
      material.subject || '', questions.length, duration,
      JSON.stringify(questions)
    );

    db.prepare('UPDATE users SET points = points + 15 WHERE id = ?').run(req.user.id);

    res.status(201).json({
      quiz: {
        id: quizId,
        title: `Quiz: ${material.title}`,
        subject: material.subject || '',
        questionCount: questions.length,
        duration,
        questions,
        status: 'available',
      },
    });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message || 'Quiz generation failed' });
  }
});

// GET /api/quizzes/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ quiz: { ...quiz, questions: JSON.parse(quiz.questions || '[]') } });
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', authenticateToken, (req, res) => {
  try {
    const { answers } = req.body;
    const db = getDB();
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const questions = JSON.parse(quiz.questions || '[]');
    let score = 0;
    questions.forEach(q => {
      const userAns = (answers[q.id] || '').toLowerCase().trim();
      const correct = (q.correctAnswer || '').toLowerCase().trim();
      if (userAns === correct) score++;
    });

    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    const attemptId = uuidv4();

    db.prepare(
      'INSERT INTO quiz_attempts (id, user_id, quiz_id, answers, score, total, percentage) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(attemptId, req.user.id, req.params.id, JSON.stringify(answers), score, questions.length, percentage);

    const pointsEarned = Math.round(percentage / 10) * 5;
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsEarned, req.user.id);

    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.id);
    const newLevel = Math.max(1, Math.floor(user.points / 500) + 1);
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, req.user.id);

    res.json({
      attempt: { id: attemptId, score, total: questions.length, percentage, pointsEarned },
      questions,
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// GET /api/quizzes/:id/attempts
router.get('/:id/attempts', authenticateToken, (req, res) => {
  const db = getDB();
  const attempts = db.prepare(
    'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY completed_at DESC'
  ).all(req.params.id, req.user.id);
  res.json({ attempts });
});

module.exports = router;
