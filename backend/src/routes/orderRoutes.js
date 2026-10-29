import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById,
  getOrderMessages,
  addOrderMessage
} from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
router.get('/:id/messages', requireAuth, getOrderMessages);
router.post('/:id/messages', requireAuth, addOrderMessage);


export default router;
