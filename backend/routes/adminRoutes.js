import express from 'express';
import {
  createStoreWithManager,
  getStores,
  updateStoreAndManager,
  deleteStoreAndManager,
  loginAdmin
} from '../controllers/adminController.js';

import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
// CRUD routes for store + manager
router.post('/stores', protectAdmin, createStoreWithManager);
router.get('/stores', protectAdmin, getStores);
router.put('/stores/:storeId', protectAdmin, updateStoreAndManager);
router.delete('/stores/:storeId', protectAdmin, deleteStoreAndManager);
// Admin login route
router.post('/login', loginAdmin);

export default router;
