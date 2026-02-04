import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.post('/refresh-token', protect, refreshToken);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

export default router;
