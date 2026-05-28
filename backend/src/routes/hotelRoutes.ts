import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getHotels,
  getHotelById,
  updateHotel,
  getHotelSettings,
} from '../controllers/hotelController';

const router = Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.get('/settings/info', authenticate, getHotelSettings);
router.put('/', authenticate, updateHotel);

export default router;
