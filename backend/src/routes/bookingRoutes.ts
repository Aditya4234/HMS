import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createBookingSchema } from '../validators/bookingValidator';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
} from '../controllers/bookingController';

const router = Router();

router.use(authenticate);
router.get('/stats', getBookingStats);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', validate(createBookingSchema), createBooking);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'), updateBookingStatus);
router.post('/:id/cancel', cancelBooking);

export default router;
