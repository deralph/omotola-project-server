const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { parseFile, formatFileSize } = require('../services/fileParser');

const router = express.Router();

// GET /api/materials
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const materials = db.prepare(
    'SELECT id, title, subject, file_type, file_name, file_size, status, upload_date FROM materials WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json({ materials });
});

// POST /api/materials/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { title, subject } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const fileType = ['jpg', 'jpeg', 'png'].includes(ext) ? 'image' : ext;
    const fileSize = formatFileSize(req.file.size);
    const materialId = uuidv4();

    const db = getDB();
    db.prepare(
      "INSERT INTO materials (id, user_id, title, subject, file_type, file_name, file_path, file_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing')"
    ).run(
      materialId, req.user.id,
      title || req.file.originalname,
      subject || '', fileType,
      req.file.originalname, req.file.path, fileSize
    );

    parseFile(req.file.path).then(textContent => {
      db.prepare('UPDATE materials SET status = ?, text_content = ? WHERE id = ?')
        .run('ready', textContent || '', materialId);
    }).catch(() => {
      db.prepare("UPDATE materials SET status = 'error' WHERE id = ?").run(materialId);
    });

    db.prepare('UPDATE users SET points = points + 10 WHERE id = ?').run(req.user.id);

    const material = db.prepare(
      'SELECT id, title, subject, file_type, file_name, file_size, status, upload_date FROM materials WHERE id = ?'
    ).get(materialId);

    res.status(201).json({ material });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// GET /api/materials/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const material = db.prepare('SELECT * FROM materials WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!material) return res.status(404).json({ error: 'Material not found' });
  res.json({ material });
});

// DELETE /api/materials/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const material = db.prepare('SELECT * FROM materials WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!material) return res.status(404).json({ error: 'Material not found' });

  if (fs.existsSync(material.file_path)) {
    try { fs.unlinkSync(material.file_path); } catch (_) {}
  }

  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
  res.json({ message: 'Material deleted' });
});

module.exports = router;
