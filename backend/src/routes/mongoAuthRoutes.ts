import { Router } from 'express';
import { authenticate } from '../middlewares/mongoAuth';
import { authLimiter } from '../middlewares/rateLimiter';
import {
  register,
  login,
  getProfile,
  logout,
  refreshTokenHandler,
} from '../controllers/mongoAuthController';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshTokenHandler);
router.get('/profile', authenticate, getProfile);

export default router;
