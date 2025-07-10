import express from 'express';
import {
  getManagerProfile,
  updateManagerProfile,
  getMyStore,
  loginManager,
  approveReturn,
  rejectReturn,
  getReturnsForMyStore,
  getManagerProducts,
  updateProduct,
  markProductAsSoldOut
} from '../controllers/managerController.js';
import { protectManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginManager);

// All routes below are protected
router.use(protectManager);

// GET /api/manager/profile
router.get('/profile', getManagerProfile);

// PUT /api/manager/profile
router.put('/profile', updateManagerProfile);

// GET /api/manager/store
router.get('/store', getMyStore);

router.get('/returns/pending', protectManager, getReturnsForMyStore);
router.put('/returns/:id/approve', protectManager, approveReturn);
router.put('/returns/:id/reject', protectManager, rejectReturn);

router.get('/products', protectManager, getManagerProducts);
router.put('/products/:id',protectManager,updateProduct);
router.put('/products/:id/soldout',protectManager, markProductAsSoldOut);


export default router;
