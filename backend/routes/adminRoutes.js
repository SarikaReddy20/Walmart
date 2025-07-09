import express from 'express';
import {
  createStoreWithManager,
  getStores,
  updateStoreAndManager,
  deleteStoreAndManager
} from '../controllers/adminController.js';

import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// CRUD routes for store + manager
router.post('/stores', protectAdmin, createStoreWithManager);
router.get('/stores', protectAdmin, getStores);
router.put('/stores/:storeId', protectAdmin, updateStoreAndManager);
router.delete('/stores/:storeId', protectAdmin, deleteStoreAndManager);

export default router;
