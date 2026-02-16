const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/contextController');
const router = express.Router();
router.use(auth);
router.post('/update', c.updateContext);
router.get('/current', c.currentContext);
module.exports = router;
