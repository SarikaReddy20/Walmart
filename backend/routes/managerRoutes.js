import express from 'express';
import {
  getManagerProfile,
  updateManagerProfile,
  getMyStore,
  loginManager
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

export default router;
