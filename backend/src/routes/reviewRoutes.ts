/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 *
 * /api/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get all reviews
 *     responses:
 *       200:
 *         description: List of reviews
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review created
 *
 * /api/reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get review by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Review details
 *   put:
 *     tags: [Reviews]
 *     summary: Update review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Review deleted
 */
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
