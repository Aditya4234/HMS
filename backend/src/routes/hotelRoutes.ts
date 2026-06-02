/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel management endpoints
 *
 * /api/hotels:
 *   get:
 *     tags: [Hotels]
 *     summary: Get all hotels
 *     responses:
 *       200:
 *         description: List of hotels
 *   put:
 *     tags: [Hotels]
 *     summary: Update hotel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hotel updated
 *
 * /api/hotels/settings/info:
 *   get:
 *     tags: [Hotels]
 *     summary: Get hotel settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hotel settings
 *
 * /api/hotels/{id}:
 *   get:
 *     tags: [Hotels]
 *     summary: Get hotel by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Hotel details
 */
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
router.get('/settings/info', authenticate, getHotelSettings);
router.get('/:id', getHotelById);
router.put('/', authenticate, updateHotel);

export default router;
