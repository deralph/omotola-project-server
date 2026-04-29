const express = require('express');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { summarizeText } = require('../services/ai');

const router = express.Router();

// POST /api/summarizer/text
router.post('/text', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Text is required' });
    if (text.trim().length < 50) return res.status(400).json({ error: 'Text is too short to summarize (min 50 characters)' });

    const summary = await summarizeText(text);

    const db = getDB();
    db.prepare('UPDATE users SET points = points + 5 WHERE id = ?').run(req.user.id);

    res.json({ summary });
  } catch (err) {
    console.error('Summarizer error:', err);
    res.status(500).json({ error: err.message || 'Summarization failed' });
  }
});

// POST /api/summarizer/material/:materialId
router.post('/material/:materialId', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const material = db.prepare('SELECT * FROM materials WHERE id = ? AND user_id = ?').get(req.params.materialId, req.user.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    if (!material.text_content) return res.status(400).json({ error: 'Material has no extractable text content' });

    const summary = await summarizeText(material.text_content);
    db.prepare('UPDATE users SET points = points + 5 WHERE id = ?').run(req.user.id);

    res.json({ summary, materialTitle: material.title });
  } catch (err) {
    console.error('Material summarizer error:', err);
    res.status(500).json({ error: err.message || 'Summarization failed' });
  }
});

module.exports = router;
