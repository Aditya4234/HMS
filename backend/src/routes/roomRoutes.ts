/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management endpoints
 *
 * components:
 *   schemas:
 *     CreateRoomRequest:
 *       type: object
 *       required: [roomNumber, roomType, pricePerNight, capacity]
 *       properties:
 *         roomNumber: { type: string }
 *         roomType: { type: string, enum: [SINGLE, DOUBLE, SUITE, DELUXE, PENTHOUSE] }
 *         pricePerNight: { type: number }
 *         capacity: { type: integer }
 *         amenities: { type: array, items: { type: string } }
 *
 * /api/rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: Get all rooms
 *     responses:
 *       200:
 *         description: List of rooms
 *   post:
 *     tags: [Rooms]
 *     summary: Create a new room
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       201:
 *         description: Room created
 *
 * /api/rooms/search:
 *   get:
 *     tags: [Rooms]
 *     summary: Search rooms
 *     responses:
 *       200:
 *         description: Search results
 *
 * /api/rooms/available:
 *   get:
 *     tags: [Rooms]
 *     summary: Get available rooms
 *     responses:
 *       200:
 *         description: Available rooms
 *
 * /api/rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Room details
 *   put:
 *     tags: [Rooms]
 *     summary: Update room
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Room updated
 *   delete:
 *     tags: [Rooms]
 *     summary: Delete room
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Room deleted
 *
 * /api/rooms/{id}/status:
 *   patch:
 *     tags: [Rooms]
 *     summary: Update room status
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
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadMultiple } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { createRoomSchema } from '../validators/roomValidator';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAvailableRooms,
  searchRooms,
} from '../controllers/roomController';

const router = Router();

router.get('/search', searchRooms);
router.get('/available', getAvailableRooms);
router.use(authenticate);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'), uploadMultiple('images', 20), validate(createRoomSchema), createRoom);
router.put('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), uploadMultiple('images', 20), updateRoom);
router.delete('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), deleteRoom);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'), updateRoomStatus);

export default router;
