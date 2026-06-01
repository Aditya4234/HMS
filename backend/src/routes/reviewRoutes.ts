import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createReviewSchema } from '../validators/reviewValidator';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';

const router = Router();

router.get('/', getReviews);
router.get('/:id', getReviewById);
router.use(authenticate);
router.post('/', validate(createReviewSchema), createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
