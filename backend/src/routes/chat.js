const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { chatWithContext } = require('../services/ai');

const router = express.Router();

// GET /api/chat/sessions
router.get('/sessions', authenticateToken, (req, res) => {
  const db = getDB();
  const sessions = db.prepare(`
    SELECT cs.id, cs.title, cs.material_ids, cs.created_at, cs.updated_at,
      (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chat_sessions cs
    WHERE cs.user_id = ?
    ORDER BY cs.updated_at DESC
  `).all(req.user.id);
  res.json({ sessions });
});

// POST /api/chat/sessions
router.post('/sessions', authenticateToken, (req, res) => {
  const { materialIds = [] } = req.body;
  const db = getDB();
  const sessionId = uuidv4();

  db.prepare('INSERT INTO chat_sessions (id, user_id, material_ids) VALUES (?, ?, ?)').run(
    sessionId, req.user.id, JSON.stringify(materialIds)
  );

  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
  res.status(201).json({ session });
});

// GET /api/chat/sessions/:id/messages
router.get('/sessions/:id/messages', authenticateToken, (req, res) => {
  const db = getDB();
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const messages = db.prepare(
    'SELECT id, role, content, references_list, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(req.params.id);

  res.json({
    session,
    messages: messages.map(m => ({
      ...m,
      references: JSON.parse(m.references_list || '[]'),
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
  });
});

// POST /api/chat/sessions/:id/messages
router.post('/sessions/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });

    const db = getDB();
    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const userMsgId = uuidv4();
    db.prepare("INSERT INTO chat_messages (id, session_id, user_id, role, content) VALUES (?, ?, ?, 'user', ?)").run(
      userMsgId, req.params.id, req.user.id, content
    );

    const materialIds = JSON.parse(session.material_ids || '[]');
    let materialTexts = [];
    let materialTitles = [];

    if (materialIds.length > 0) {
      const placeholders = materialIds.map(() => '?').join(',');
      const mats = db.prepare(
        `SELECT title, text_content FROM materials WHERE id IN (${placeholders}) AND user_id = ?`
      ).all(...materialIds, req.user.id);
      materialTexts = mats.filter(m => m.text_content).map(m => `[${m.title}]\n${m.text_content}`);
      materialTitles = mats.map(m => m.title);
    }

    const history = db.prepare(
      'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 20'
    ).all(req.params.id);

    const aiResponse = await chatWithContext(content, materialTexts, history);

    const aiMsgId = uuidv4();
    db.prepare(
      "INSERT INTO chat_messages (id, session_id, user_id, role, content, references_list) VALUES (?, ?, ?, 'ai', ?, ?)"
    ).run(aiMsgId, req.params.id, req.user.id, aiResponse, JSON.stringify(materialTitles));

    db.prepare("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    db.prepare('UPDATE users SET points = points + 2 WHERE id = ?').run(req.user.id);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    res.json({
      userMessage: { id: userMsgId, role: 'user', content, references: [], timestamp: now },
      aiMessage: { id: aiMsgId, role: 'ai', content: aiResponse, references: materialTitles, timestamp: now },
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'AI chat failed. Check your GEMINI_API_KEY.' });
  }
});

// DELETE /api/chat/sessions/:id
router.delete('/sessions/:id', authenticateToken, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Session cleared' });
});

// POST /api/chat/quick (stateless single message, no session needed)
router.post('/quick', authenticateToken, async (req, res) => {
  try {
    const { content, materialIds = [] } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });

    const db = getDB();
    let materialTexts = [];
    let materialTitles = [];

    if (materialIds.length > 0) {
      const placeholders = materialIds.map(() => '?').join(',');
      const mats = db.prepare(
        `SELECT title, text_content FROM materials WHERE id IN (${placeholders}) AND user_id = ?`
      ).all(...materialIds, req.user.id);
      materialTexts = mats.filter(m => m.text_content).map(m => `[${m.title}]\n${m.text_content}`);
      materialTitles = mats.map(m => m.title);
    }

    const aiResponse = await chatWithContext(content, materialTexts, []);
    db.prepare('UPDATE users SET points = points + 2 WHERE id = ?').run(req.user.id);

    res.json({
      content: aiResponse,
      references: materialTitles,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err) {
    console.error('Quick chat error:', err);
    res.status(500).json({ error: err.message || 'AI chat failed. Check your GEMINI_API_KEY.' });
  }
});

module.exports = router;
