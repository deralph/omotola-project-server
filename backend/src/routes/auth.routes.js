const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../utils/validators');
const c = require('../controllers/authController');

const router = express.Router();
router.post('/register', validate(registerSchema), c.register);
router.post('/login', validate(loginSchema), c.login);
router.post('/logout', auth, c.logout);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);
router.get('/me', auth, c.me);
router.get('/verify-email/:token', c.verifyEmail);
router.post('/resend-verification', c.resendVerification);
router.post('/refresh-token', auth, c.refreshToken);
router.post('/change-password', auth, c.changePassword);
module.exports = router;
