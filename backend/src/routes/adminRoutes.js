import express from 'express';
import { 
  getOverview, 
  getOrders, 
  getCustomers, 
  getAdminVehicles, 
  createAdminVehicle, 
  updateAdminVehicle, 
  getAdminCoupons, 
  createAdminCoupon, 
  updateAdminCoupon, 
  getAdminPayments, 
  getReports,
  updateAdminOrder,
  deleteAdminOrder,
  deleteAdminCoupon,
  getAdminSettings,
  updateAdminSettings
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes are protected by role-based authorization
router.use(requireAdmin);

router.get('/overview', getOverview);
router.get('/orders', getOrders);
router.patch('/orders/:id', updateAdminOrder);
router.delete('/orders/:id', deleteAdminOrder);
router.get('/customers', getCustomers);
router.get('/vehicles', getAdminVehicles);
router.post('/vehicles', createAdminVehicle);
router.patch('/vehicles/:id', updateAdminVehicle);
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.patch('/coupons/:id', updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);
router.get('/payments', getAdminPayments);
router.get('/reports', getReports);
router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

export default router;
