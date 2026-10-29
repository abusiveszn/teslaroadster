import { Orders, Payments, Coupons, Notifications, Users } from '../models/store.js';

export const initializePayment = async (req, res) => {
  try {
    const { orderId, provider = 'Credit / Debit Card' } = req.body;

    const order = await Orders.findById(orderId) || (await Orders.findOne({ orderNumber: orderId }));
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'This order has already been paid and verified.' });
    }

    const providerReference = 'SIM-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    const payment = await Payments.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      provider: `${provider} (Simulated)`,
      providerReference,
      amount: order.finalPrice,
      currency: order.currency || 'USD',
      status: 'pending',
      isTestPayment: true,
      createdAt: new Date().toISOString()
    });

    return res.json({
      message: 'Simulated payment session initialized.',
      paymentId: payment._id,
      providerReference,
      amount: order.finalPrice,
      currency: order.currency,
      provider: payment.provider,
      orderNumber: order.orderNumber
    });
  } catch (err) {
    console.error('initializePayment error:', err);
    return res.status(500).json({ error: 'Failed to initialize payment session.' });
  }
};

export const simulatePayment = async (req, res) => {
  try {
    const { 
      orderId, 
      providerReference, 
      outcome = 'success', 
      provider = 'Credit / Debit Card',
      proofOfPayment,
      txHash
    } = req.body;

    const order = await Orders.findById(orderId) || (await Orders.findOne({ orderNumber: orderId }));
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Prevent duplicate payment or replaying payment on already paid order
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ 
        verified: false, 
        error: 'Order has already been confirmed and paid. Cannot re-process payment.' 
      });
    }

    // Find or create payment record
    let payment = null;
    if (providerReference) {
      payment = await Payments.findOne({ providerReference });
    }
    if (!payment) {
      payment = await Payments.findOne({ orderId: order._id });
    }

    const effectiveProof = proofOfPayment || order.proofOfPayment || null;
    const effectiveTxHash = txHash || order.txHash || null;

    if (outcome === 'success') {
      // 1. Update Payment status
      const verifiedAt = new Date().toISOString();
      if (payment) {
        payment = await Payments.findByIdAndUpdate(payment._id, {
          status: 'success',
          provider: `${provider} (Simulated)`,
          verifiedAt,
          isTestPayment: true,
          proofOfPayment: effectiveProof,
          txHash: effectiveTxHash
        });
      } else {
        payment = await Payments.create({
          orderId: order._id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          provider: `${provider} (Simulated)`,
          providerReference: providerReference || 'SIM-' + Date.now(),
          amount: order.finalPrice,
          currency: order.currency || 'USD',
          status: 'success',
          isTestPayment: true,
          verifiedAt,
          proofOfPayment: effectiveProof,
          txHash: effectiveTxHash,
          createdAt: new Date().toISOString()
        });
      }

      // 2. Update Order status
      const updatedOrder = await Orders.findByIdAndUpdate(order._id, {
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: provider,
        paidAt: verifiedAt,
        proofOfPayment: effectiveProof,
        txHash: effectiveTxHash
      });

      // 3. Increment coupon usage if used
      if (order.couponCode) {
        const coupon = await Coupons.findOne({ code: order.couponCode });
        if (coupon) {
          await Coupons.findByIdAndUpdate(coupon._id, {
            usageCount: (coupon.usageCount || 0) + 1
          });
        }
      }

      // 4. Create in-app notification for the user
      await Notifications.create({
        userId: order.userId,
        type: 'payment_success',
        subject: `Payment Confirmed (${order.orderNumber})`,
        message: `Your simulated pre-sale order for ${order.vehicleName} has been confirmed. Total Paid: $${order.finalPrice.toLocaleString()}.`,
        readAt: null,
        createdAt: verifiedAt
      });

      return res.json({
        verified: true,
        status: 'success',
        message: 'Payment simulation succeeded and backend order verified.',
        order: updatedOrder,
        payment
      });
    } else if (outcome === 'failure') {
      if (payment) {
        await Payments.findByIdAndUpdate(payment._id, {
          status: 'failed',
          failureReason: 'Test transaction declined by simulated card gateway.'
        });
      }
      await Orders.findByIdAndUpdate(order._id, {
        paymentStatus: 'failed'
      });

      return res.status(402).json({
        verified: false,
        status: 'failed',
        error: 'Payment declined. The simulated gateway rejected the transaction. You can retry with a different simulated option.'
      });
    } else {
      // outcome === 'cancel'
      if (payment) {
        await Payments.findByIdAndUpdate(payment._id, { status: 'cancelled' });
      }
      return res.json({
        verified: false,
        status: 'cancelled',
        message: 'Payment simulation cancelled by user.'
      });
    }
  } catch (err) {
    console.error('simulatePayment error:', err);
    return res.status(500).json({ error: 'Internal error during payment simulation.' });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await Payments.findOne({ providerReference: reference }) || (await Payments.findOne({ orderNumber: reference }));
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }
    return res.json({ payment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch payment status.' });
  }
};

export const handleWebhook = async (req, res) => {
  // Webhook handler placeholder for live Paystack/Flutterwave
  // In demo mode, acknowledges with valid simulated response
  return res.status(200).json({ received: true, mode: 'demo_simulation' });
};
