const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/resourceController');
const router = express.Router();
router.use(auth);
router.get('/', c.listResources);
router.post('/:id/bookmark', c.bookmarkResource);
router.get('/bookmarked', c.getBookmarked);
module.exports = router;
