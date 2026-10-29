import express from 'express';
import { 
  initializePayment, 
  simulatePayment, 
  getPaymentStatus, 
  handleWebhook 
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/initialize', initializePayment);
router.post('/simulate', simulatePayment);
router.get('/:reference/status', getPaymentStatus);
router.post('/webhook', handleWebhook);

export default router;
