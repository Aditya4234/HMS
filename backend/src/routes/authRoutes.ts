/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 *
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *     RegisterRequest:
 *       type: object
 *       required: [email, password, fullName]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *         fullName: { type: string }
 *         phoneNumber: { type: string, nullable: true }
 *
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP sent
 *
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string }
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               resetToken: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from '../validators/authValidator';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resendOTP,
  verifyOTP,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  deleteAccount,
} from '../controllers/authController';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/resend-otp', authLimiter, validate(forgotPasswordSchema), resendOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.post('/verify-email', authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', authLimiter, validate(forgotPasswordSchema), resendVerificationEmail);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('avatar'), validate(updateProfileSchema), updateProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;