import { Router } from 'express';
import { authLimiter } from '../middlewares/rateLimiter';
import { googleLogin } from '../controllers/googleAuthController';

const router = Router();

router.post('/google', authLimiter, googleLogin);

export default router;
