import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { aiSearchRooms, aiChat } from '../controllers/aiController';

const router = Router();

router.use(authenticate);
router.post('/search', aiSearchRooms);
router.post('/chat', aiChat);

export default router;
