import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomer,
  submitReturn,
  getMyReturns,
  getCustomerImpact,
  getNearestStoreProducts,
} from '../controllers/customerController.js';
import { protectCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected (customer)
router.get('/profile', protectCustomer, getCustomerProfile);
router.put('/profile', protectCustomer, updateCustomer);
router.get('/returns', protectCustomer, getMyReturns);
router.post('/returns', protectCustomer, submitReturn);
router.get('/impact', protectCustomer, getCustomerImpact);
router.get('/products', protectCustomer, getNearestStoreProducts);
export default router;