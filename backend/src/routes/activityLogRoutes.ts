import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getActivityLogs } from '../controllers/activityLogController';

const router = Router();

router.get('/', authenticate, getActivityLogs);

export default router;
