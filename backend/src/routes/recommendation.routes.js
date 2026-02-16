const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/recommendationController');
const router = express.Router();
router.use(auth);
router.get('/', c.getRecommendations);
router.post('/feedback', c.feedback);
module.exports = router;
