const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_RESOURCES = [
  { title: 'Introduction to Algorithms — MIT OCW', type: 'Video', subject: 'Computer Science', rating: 4.8, duration: '1h 20m', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/' },
  { title: 'Understanding Big-O Notation', type: 'Article', subject: 'Computer Science', rating: 4.5, duration: '15 min read', url: 'https://www.freecodecamp.org/news/big-o-notation-explained-with-examples/' },
  { title: 'Khan Academy — Calculus', type: 'Video', subject: 'Mathematics', rating: 4.6, duration: 'Self-paced', url: 'https://www.khanacademy.org/math/calculus-1' },
  { title: 'Database Design Tutorial', type: 'Video', subject: 'Computer Science', rating: 4.3, duration: '45 min', url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc' },
  { title: 'Digital Electronics Fundamentals', type: 'Article', subject: 'Engineering', rating: 4.1, duration: '25 min read', url: 'https://www.electronics-tutorials.ws/logic/logic_1.html' },
  { title: 'Linear Algebra — 3Blue1Brown', type: 'Video', subject: 'Mathematics', rating: 4.9, duration: '3h total', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
  { title: 'Python for Beginners', type: 'Video', subject: 'Computer Science', rating: 4.7, duration: '6h', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
];

function seedResources(db, userId) {
  const count = db.prepare('SELECT COUNT(*) as count FROM resources WHERE user_id = ?').get(userId).count;
  if (count > 0) return;
  const stmt = db.prepare(
    'INSERT INTO resources (id, user_id, title, type, subject, rating, duration, url, bookmarked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
  );
  DEFAULT_RESOURCES.forEach(r => stmt.run(uuidv4(), userId, r.title, r.type, r.subject, r.rating, r.duration, r.url));
}

// GET /api/resources
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  seedResources(db, req.user.id);
  const resources = db.prepare(
    'SELECT id, title, type, subject, rating, duration, url, bookmarked FROM resources WHERE user_id = ? ORDER BY bookmarked DESC, created_at DESC'
  ).all(req.user.id);
  res.json({ resources: resources.map(r => ({ ...r, bookmarked: Boolean(r.bookmarked) })) });
});

// POST /api/resources
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, type, subject, rating, duration, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Title and URL are required' });

    const db = getDB();
    const id = uuidv4();
    db.prepare(
      'INSERT INTO resources (id, user_id, title, type, subject, rating, duration, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.user.id, title, type || 'Article', subject || '', rating || 0, duration || '', url);

    const resource = db.prepare(
      'SELECT id, title, type, subject, rating, duration, url, bookmarked FROM resources WHERE id = ?'
    ).get(id);
    res.status(201).json({ resource: { ...resource, bookmarked: Boolean(resource.bookmarked) } });
  } catch (err) {
    console.error('Create resource error:', err);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PATCH /api/resources/:id/bookmark
router.patch('/:id/bookmark', authenticateToken, (req, res) => {
  const db = getDB();
  const resource = db.prepare('SELECT * FROM resources WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const newVal = resource.bookmarked ? 0 : 1;
  db.prepare('UPDATE resources SET bookmarked = ? WHERE id = ?').run(newVal, req.params.id);
  res.json({ bookmarked: Boolean(newVal) });
});

// DELETE /api/resources/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM resources WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Resource not found' });
  res.json({ message: 'Resource deleted' });
});

module.exports = router;
