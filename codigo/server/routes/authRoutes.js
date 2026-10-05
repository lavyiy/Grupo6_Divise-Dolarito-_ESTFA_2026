const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { rateLimit } = require('../middlewares/rateLimiter');

// Protección contra fuerza bruta y spam de emails (CP-082).
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.get('/verify-email', authLimiter, authController.verifyEmailByToken);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.all('/test-email', authLimiter, authController.testEmail);

module.exports = router;

