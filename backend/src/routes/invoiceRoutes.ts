import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getInvoices, getInvoiceById } from '../controllers/invoiceController';

const router = Router();

router.use(authenticate);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

export default router;
