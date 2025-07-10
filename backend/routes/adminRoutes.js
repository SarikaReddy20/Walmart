import express from 'express';
import {
  createStoreWithManager,
  getStores,
  updateStoreAndManager,
  deleteStoreAndManager,
  registerAdmin,
  loginAdmin,
  getAllProducts
} from '../controllers/adminController.js';

import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
// CRUD routes for store + manager
router.post('/stores', protectAdmin, createStoreWithManager);
router.get('/stores', protectAdmin, getStores);
router.put('/stores/:storeId', protectAdmin, updateStoreAndManager);
router.delete('/stores/:storeId', protectAdmin, deleteStoreAndManager);
router.get('/products', protectAdmin, getAllProducts);

export default router;
