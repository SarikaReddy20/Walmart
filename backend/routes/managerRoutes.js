import express from 'express';
import { protectManager } from '../middleware/authMiddleware.js';

import {
  getManagerProfile,
  updateManagerProfile,
  loginManager,
  addProduct,
  updateProduct,
  deleteProduct,
  markProductAsSoldOut,
  addOrUpdateForecast,
  reduceForecastDemand,
  getStoreProducts,
  getMyStore,
  approveReturn,
  rejectReturn,
  getReturnsForMyStore,
    requestRedistribution,
    approveRedistribution,
    rejectRedistribution,
    getManagerRedistributions
} from '../controllers/managerController.js';

const router = express.Router();


// Manager login
router.post('/login', loginManager);


// Manager-only endpoints
router.get('/profile', protectManager, getManagerProfile);
router.put('/profile', protectManager, updateManagerProfile);

router.get('/store', protectManager, getMyStore);

router.get('/products', protectManager, getStoreProducts);
router.post('/products', protectManager, addProduct);
router.put('/products/:productId', protectManager, updateProduct);
router.delete('/products/:productId', protectManager, deleteProduct);
router.put('/products/:productId/sold-out', protectManager, markProductAsSoldOut);

router.get('/returns/pending', protectManager, getReturnsForMyStore);
router.put('/returns/:id/approve', protectManager, approveReturn);
router.put('/returns/:id/reject', protectManager, rejectReturn);

router.post('/forecasts', protectManager, addOrUpdateForecast);
router.patch('/forecasts/:forecastId/reduce-demand', protectManager, reduceForecastDemand);

router.post('/redistributions', protectManager, requestRedistribution);
router.put('/redistributions/:id/approve', protectManager, approveRedistribution);
router.put('/redistributions/:id/reject', protectManager, rejectRedistribution);
router.get('/redistributions', protectManager, getManagerRedistributions);

export default router;
