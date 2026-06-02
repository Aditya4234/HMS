/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management endpoints
 *
 * /api/staff:
 *   get:
 *     tags: [Staff]
 *     summary: Get all staff members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff
 *   post:
 *     tags: [Staff]
 *     summary: Create a staff member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Staff created
 *
 * /api/staff/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Staff details
 *   put:
 *     tags: [Staff]
 *     summary: Update staff member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Staff updated
 *   delete:
 *     tags: [Staff]
 *     summary: Delete staff member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Staff deleted
 */
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
