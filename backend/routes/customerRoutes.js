import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomer,
} from '../controllers/customerController.js';
import { protectCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected (customer)
router.get('/profile', protectCustomer, getCustomerProfile);
router.put('/profile', protectCustomer, updateCustomer);

export default router;
