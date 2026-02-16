const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const c = require('../controllers/materialController');

const router = express.Router();
router.use(auth);
router.post('/upload', upload.single('file'), c.uploadMaterial);
router.get('/', c.listMaterials);
router.get('/:id', c.getMaterial);
router.put('/:id', c.updateMaterial);
router.delete('/:id', c.deleteMaterial);
router.get('/:id/summary', c.getSummary);
router.post('/:id/analyze', c.analyzeMaterial);
module.exports = router;
