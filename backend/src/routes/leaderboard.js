const express = require('express');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();

  const leaderboard = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.department,
      u.points,
      u.study_streak as streak,
      u.level,
      COUNT(DISTINCT qa.id) as quizzes,
      UPPER(SUBSTR(u.name, 1, 1)) ||
        COALESCE(UPPER(SUBSTR(u.name, INSTR(u.name, ' ') + 1, 1)), '') as avatar
    FROM users u
    LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
    GROUP BY u.id
    ORDER BY u.points DESC
    LIMIT 50
  `).all();

  const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));
  const myEntry = ranked.find(e => e.id === req.user.id);

  res.json({ leaderboard: ranked, myRank: myEntry || null });
});

module.exports = router;
