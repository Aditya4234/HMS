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
