/**
 * THE CANDLEIER — AUTHENTICATION ROUTER
 * Routes for Signup, Login, OAuth, Password Reset, and Sessions.
 */

import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword
} from '../middleware/validation.js';

const router = Router();

// Public Authentication Endpoints
router.get('/config', AuthController.getConfig);
router.post('/register', validateSignup, AuthController.register);
router.post('/signup', validateSignup, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/google', AuthController.googleAuth);
router.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);
router.post('/recover', validateForgotPassword, AuthController.forgotPassword);
router.post('/verify-otp', validateVerifyOtp, AuthController.verifyOtp);
router.post('/reset-password', validateResetPassword, AuthController.resetPassword);

// Session Endpoints
router.post('/logout', optionalAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.get('/session', optionalAuth, (req, res) => {
  if (req.user) {
    return AuthController.getMe(req, res);
  }
  return res.json({ success: true, authenticated: false, customer: null });
});

export default router;
