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
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoiceValidator';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoiceController';

const router = Router();

router.use(authenticate);
router.post('/', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), validate(createInvoiceSchema), createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', authorize('SUPER_ADMIN', 'HOTEL_ADMIN'), validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteInvoice);

export default router;
