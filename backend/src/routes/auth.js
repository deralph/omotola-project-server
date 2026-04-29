const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'studymate_secret_key_2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, year, university } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, department, year, university) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      userId, name.trim(), email.toLowerCase(), passwordHash,
      department || '', year || '',
      university || 'Adekunle Ajasin University (AAUA)'
    );

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const user = db.prepare(
      'SELECT id, name, email, department, year, university, avatar, study_streak, level, points FROM users WHERE id = ?'
    ).get(userId);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    updateStreak(db, user);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const safeUser = db.prepare(
      'SELECT id, name, email, department, year, university, avatar, study_streak, level, points FROM users WHERE id = ?'
    ).get(user.id);

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, department, year } = req.body;
    const db = getDB();

    db.prepare('UPDATE users SET name = ?, department = ?, year = ? WHERE id = ?').run(
      name || req.user.name,
      department || req.user.department,
      year || req.user.year,
      req.user.id
    );

    const updated = db.prepare(
      'SELECT id, name, email, department, year, university, avatar, study_streak, level, points FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// PUT /api/auth/preferences
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const { preferences } = req.body;
    const db = getDB();
    db.prepare('UPDATE users SET preferences = ? WHERE id = ?').run(
      JSON.stringify(preferences), req.user.id
    );
    res.json({ message: 'Preferences saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// DELETE /api/auth/account
router.delete('/account', authenticateToken, (req, res) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

function updateStreak(db, user) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (user.last_study_date === today) return;

  const newStreak = user.last_study_date === yesterday ? user.study_streak + 1 : 1;
  db.prepare('UPDATE users SET study_streak = ?, last_study_date = ? WHERE id = ?')
    .run(newStreak, today, user.id);
}

module.exports = router;
