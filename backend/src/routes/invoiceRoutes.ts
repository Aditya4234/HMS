/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management endpoints
 *
 * /api/invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Get all invoices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *
 * /api/invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Invoice details
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getInvoices, getInvoiceById } from '../controllers/invoiceController';

const router = Router();

router.use(authenticate);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

export default router;
