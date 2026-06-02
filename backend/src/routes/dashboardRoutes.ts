/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics endpoints
 *
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *
 * /api/dashboard/revenue-chart:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get revenue chart data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue chart data
 *
 * /api/dashboard/booking-chart:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get booking chart data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking chart data
 *
 * /api/dashboard/recent-activities:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities
 *
 * /api/dashboard/top-rooms:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get top performing rooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top rooms
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getDashboardStats,
  getRevenueChart,
  getBookingChart,
  getRecentActivities,
  getTopRooms,
} from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);
router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/booking-chart', getBookingChart);
router.get('/recent-activities', getRecentActivities);
router.get('/top-rooms', getTopRooms);

export default router;
