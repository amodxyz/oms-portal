import { Router } from 'express';
import {
  register, login, refresh, logout, logoutAll,
  verifyEmail, resendVerification,
  forgotPassword, resetPassword,
  getProfile, updateProfile,
  getUsers, createUser, updateUser,
  getTenant, updateTenant,
} from './auth.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate, registerRules, loginRules, createUserRules } from '../../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();

// Public
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/verify-email', body('token').notEmpty(), validate, verifyEmail);
router.post('/forgot-password', body('email').isEmail().normalizeEmail(), validate, forgotPassword);
router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate, resetPassword
);

// Protected
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/resend-verification', authenticate, resendVerification);
router.post('/logout-all', authenticate, logoutAll);

// Admin
router.get('/users', authenticate, authorize('ADMIN'), getUsers);
router.post('/users', authenticate, authorize('ADMIN'), createUserRules, validate, createUser);
router.put('/users/:id', authenticate, authorize('ADMIN'), updateUser);
router.get('/tenant', authenticate, getTenant);
router.put('/tenant', authenticate, authorize('ADMIN'), updateTenant);

export default router;
