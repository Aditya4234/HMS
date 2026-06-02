/** 
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 *
 * components:
 *   schemas:
 *     CreateBookingRequest:
 *       type: object
 *       required: [roomId, checkIn, checkOut]
 *       properties:
 *         roomId: { type: string, format: uuid }
 *         checkIn: { type: string, format: date }
 *         checkOut: { type: string, format: date }
 *         guests: { type: integer, minimum: 1 }
 *
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created
 *
 * /api/bookings/stats:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking stats
 *
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Booking details
 *
 * /api/bookings/{id}/status:
 *   patch:
 *     tags: [Bookings]
 *     summary: Update booking status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Status updated
 *
 * /api/bookings/{id}/cancel:
 *   post:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
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
