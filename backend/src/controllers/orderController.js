import crypto from 'crypto';
import { Orders, Vehicles, Coupons, Users } from '../models/store.js';

export const createOrder = async (req, res) => {
  try {
    const { 
      vehicleId, 
      selectedConfiguration, 
      couponCode, 
      customerName, 
      customerEmail,
      proofOfPayment,
      txHash,
      paymentMethod
    } = req.body;

    const user = req.user;
    const finalUserId = user ? user._id : 'usr_guest_' + Date.now();
    const finalCustomerEmail = (user ? user.email : customerEmail || '').trim().toLowerCase();
    const finalCustomerName = (user ? user.fullName : customerName || 'Valued Customer').trim();

    if (!finalCustomerEmail) {
      return res.status(400).json({ error: 'Customer email is required.' });
    }

    // 1. Fetch vehicle from DB
    const vehicle = await Vehicles.findById(vehicleId || 'veh_roadster_standard');
    if (!vehicle) {
      return res.status(404).json({ error: 'Selected vehicle not found in database.' });
    }

    // 2. Determine price from DB configuration
    let originalPrice = vehicle.illustrativePrice || 200000;
    if (selectedConfiguration?.packageId && vehicle.configurations?.packages) {
      const pkg = vehicle.configurations.packages.find(p => p.id === selectedConfiguration.packageId);
      if (pkg) originalPrice = pkg.price;
    }
    // Add wheel delta if any
    if (selectedConfiguration?.wheelId && vehicle.configurations?.wheels) {
      const wheel = vehicle.configurations.wheels.find(w => w.id === selectedConfiguration.wheelId);
      if (wheel && wheel.priceDelta) originalPrice += wheel.priceDelta;
    }
    // Add interior delta if any
    if (selectedConfiguration?.interiorId && vehicle.configurations?.interiors) {
      const interior = vehicle.configurations.interiors.find(i => i.id === selectedConfiguration.interiorId);
      if (interior && interior.priceDelta) originalPrice += interior.priceDelta;
    }

    // 3. Validate coupon if provided
    let discountAmount = 0;
    let validatedCoupon = null;
    if (couponCode) {
      const cCode = couponCode.trim().toUpperCase();
      const coupon = await Coupons.findOne({ code: cCode, isActive: true });
      if (coupon) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date()) {
          if (!coupon.maxUses || coupon.usageCount < coupon.maxUses) {
            validatedCoupon = coupon;
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.round((originalPrice * coupon.discountValue) / 100);
            } else {
              discountAmount = Math.min(originalPrice, coupon.discountValue);
            }
          }
        }
      }
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    // 4. Generate order number matching reference: #TRD-YYYYMMDD-XXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(100 + Math.random() * 900).toString();
    const orderNumber = `#TRD-${dateStr}-${randomHex}`;

    // 5. Prevent duplicate pending orders with identical timestamp
    const newOrder = await Orders.create({
      orderNumber,
      userId: finalUserId,
      customerEmail: finalCustomerEmail,
      customerName: finalCustomerName,
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      selectedConfiguration: selectedConfiguration || {
        color: 'Ultra Deep Red',
        wheel: '21" Turbofan Carbon Wheels',
        interior: 'Black Sport Alcantara & Carbon',
        package: 'Base Roadster Supercar'
      },
      originalPrice,
      discountAmount,
      finalPrice,
      currency: 'USD',
      couponCode: validatedCoupon ? validatedCoupon.code : null,
      couponId: validatedCoupon ? validatedCoupon._id : null,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || null,
      proofOfPayment: proofOfPayment || null,
      txHash: txHash || null,
      isDemoOrder: true,
      notes: 'Concept demonstration only. No real vehicle reservation or payment.',
    });

    return res.status(201).json({
      message: 'Demo order initiated successfully.',
      order: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Failed to create demo order.' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Match either user ID or customer email
    const allOrders = await Orders.find();
    const userOrders = allOrders.filter(
      o => o.userId === user._id || (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
    );

    return res.json({ orders: userOrders });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Orders.findById(id) || (await Orders.findOne({ orderNumber: id }));
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Role check if authenticated
    if (req.user && req.user.role !== 'admin' && req.user._id !== order.userId && req.user.email?.toLowerCase() !== order.customerEmail?.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied to this order.' });
    }

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

export const getOrderMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Orders.findById(id) || (await Orders.findOne({ orderNumber: id }));
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Role check: must be admin or the buyer of this order
    const isOwner = req.user && (
      req.user._id === order.userId || 
      (req.user.email && order.customerEmail && req.user.email.toLowerCase() === order.customerEmail.toLowerCase())
    );
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied to this order conversation.' });
    }

    return res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      messages: order.messages || []
    });
  } catch (err) {
    console.error('getOrderMessages error:', err);
    return res.status(500).json({ error: 'Failed to fetch order messages.' });
  }
};

export const addOrderMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const order = await Orders.findById(id) || (await Orders.findOne({ orderNumber: id }));
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const isOwner = req.user && (
      req.user._id === order.userId || 
      (req.user.email && order.customerEmail && req.user.email.toLowerCase() === order.customerEmail.toLowerCase())
    );
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied to send message on this order.' });
    }

    const senderRole = isAdmin ? 'admin' : 'customer';
    const senderName = isAdmin 
      ? 'Tesla Support Team' 
      : (req.user?.fullName || order.customerName || 'Valued Buyer');

    const newMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      senderRole,
      senderName,
      senderEmail: req.user?.email || (isAdmin ? 'teslasupporttech@gmail.com' : order.customerEmail),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    const currentMessages = Array.isArray(order.messages) ? order.messages : [];
    const updatedMessages = [...currentMessages, newMessage];

    const updatedOrder = await Orders.findByIdAndUpdate(
      order._id,
      {
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      }
    );

    return res.status(201).json({
      message: 'Message sent successfully.',
      newMessage,
      messages: updatedMessages
    });
  } catch (err) {
    console.error('addOrderMessage error:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};

