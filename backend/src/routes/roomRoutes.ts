import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadMultiple } from '../middlewares/upload';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAvailableRooms,
} from '../controllers/roomController';

const router = Router();

router.get('/available', getAvailableRooms);
router.use(authenticate);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'), uploadMultiple('images', 5), createRoom);
router.put('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), uploadMultiple('images', 5), updateRoom);
router.delete('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), deleteRoom);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'), updateRoomStatus);

export default router;
