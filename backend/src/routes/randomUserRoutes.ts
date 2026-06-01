import { Router } from 'express';
import { getRandomUsers } from '../controllers/randomUserController';

const router = Router();

router.get('/', getRandomUsers);

export default router;
