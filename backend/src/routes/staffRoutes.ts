import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController';

const router = Router();

router.use(authenticate);
router.get('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), getStaff);
router.get('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), getStaffById);
router.post('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), createStaff);
router.put('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), updateStaff);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteStaff);

export default router;
