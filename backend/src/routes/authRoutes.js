import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  verifyEmail, 
  resendVerification, 
  sendLoginOtp,
  verifyLoginOtp,
  forgotPassword, 
  resetPassword,
  getDemoLogs 
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, getMe);
router.get('/demo-email-logs', getDemoLogs);

export default router;
