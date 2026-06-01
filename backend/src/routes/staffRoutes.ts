import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createStaffSchema } from '../validators/staffValidator';
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
router.post('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), validate(createStaffSchema), createStaff);
router.put('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), updateStaff);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteStaff);

export default router;
