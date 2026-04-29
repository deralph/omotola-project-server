const jwt = require('jsonwebtoken');
const { getDB } = require('../db/database');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'studymate_secret_key_2024');
    const db = getDB();
    const user = db.prepare(
      'SELECT id, name, email, department, year, university, avatar, study_streak, level, points FROM users WHERE id = ?'
    ).get(decoded.userId);

    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };
