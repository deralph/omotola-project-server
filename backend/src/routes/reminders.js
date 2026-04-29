const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/reminders
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const reminders = db.prepare(
    'SELECT id, title, time, recurrence, enabled, condition_text as condition FROM reminders WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json({ reminders: reminders.map(r => ({ ...r, enabled: Boolean(r.enabled) })) });
});

// POST /api/reminders
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, time, recurrence, condition } = req.body;
    if (!title || !time) return res.status(400).json({ error: 'Title and time are required' });

    const db = getDB();
    const id = uuidv4();
    db.prepare(
      'INSERT INTO reminders (id, user_id, title, time, recurrence, condition_text, enabled) VALUES (?, ?, ?, ?, ?, ?, 1)'
    ).run(id, req.user.id, title, time, recurrence || 'once', condition || null);

    const reminder = db.prepare(
      'SELECT id, title, time, recurrence, enabled, condition_text as condition FROM reminders WHERE id = ?'
    ).get(id);
    res.status(201).json({ reminder: { ...reminder, enabled: Boolean(reminder.enabled) } });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// PUT /api/reminders/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { title, time, recurrence, enabled, condition } = req.body;
    const db = getDB();
    const existing = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Reminder not found' });

    db.prepare(
      'UPDATE reminders SET title = ?, time = ?, recurrence = ?, enabled = ?, condition_text = ? WHERE id = ?'
    ).run(
      title ?? existing.title,
      time ?? existing.time,
      recurrence ?? existing.recurrence,
      enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled,
      condition !== undefined ? condition : existing.condition_text,
      req.params.id
    );

    const updated = db.prepare(
      'SELECT id, title, time, recurrence, enabled, condition_text as condition FROM reminders WHERE id = ?'
    ).get(req.params.id);
    res.json({ reminder: { ...updated, enabled: Boolean(updated.enabled) } });
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Reminder not found' });
  res.json({ message: 'Reminder deleted' });
});

module.exports = router;
