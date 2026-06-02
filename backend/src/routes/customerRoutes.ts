/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
 *
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 *
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Customer details
 *   put:
 *     tags: [Customers]
 *     summary: Update customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Customer updated
 *   delete:
 *     tags: [Customers]
 *     summary: Delete customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Customer deleted
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';

const router = Router();

router.use(authenticate);
router.get('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'), getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), updateCustomer);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteCustomer);

export default router;
