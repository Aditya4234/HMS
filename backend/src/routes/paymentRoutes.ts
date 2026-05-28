import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
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
router.post('/', createPayment);
router.post('/confirm', confirmPayment);
router.post('/:id/refund', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), processRefund);

export default router;
