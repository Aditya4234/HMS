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
