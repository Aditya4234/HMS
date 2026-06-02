/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 *
 * components:
 *   schemas:
 *     CreatePaymentRequest:
 *       type: object
 *       required: [bookingId, method]
 *       properties:
 *         bookingId: { type: string, format: uuid }
 *         method: { type: string, enum: [CASH, STRIPE, RAZORPAY, PAYPAL] }
 *     ConfirmPaymentRequest:
 *       type: object
 *       required: [paymentId]
 *       properties:
 *         paymentId: { type: string, format: uuid }
 *         transactionId: { type: string }
 *
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment initiated
 *
 * /api/payments/stats:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment stats
 *
 * /api/payments/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm a payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment confirmed
 *
 * /api/payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Process a refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Refund processed
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createPaymentSchema, confirmPaymentSchema } from '../validators/paymentValidator';
import {
  createPayment,
  confirmPayment,
  getPayments,
  processRefund,
  getPaymentStats,
} from '../controllers/paymentController';

const router = Router();

router.use(authenticate);
router.get('/stats', getPaymentStats);
router.get('/', getPayments);
router.post('/', validate(createPaymentSchema), createPayment);
router.post('/confirm', validate(confirmPaymentSchema), confirmPayment);
router.post('/:id/refund', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), processRefund);

export default router;
