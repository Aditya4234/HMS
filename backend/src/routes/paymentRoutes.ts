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
