import { Orders, Users, Vehicles, Coupons, Payments, Notifications, Settings } from '../models/store.js';

export const getOverview = async (req, res) => {
  try {
    const orders = await Orders.find();
    const users = await Users.find({ role: 'customer' });
    const coupons = await Coupons.find({ isActive: true });
    const payments = await Payments.find({ status: 'success' });

    // Calculate total simulated revenue from paid orders
    const simulatedRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (Number(o.finalPrice) || 0), 0);

    const totalOrders = orders.length;
    const totalCustomers = users.length;
    const activeCoupons = coupons.length;

    // Recent orders (latest 10)
    const recentOrders = orders.slice(0, 10);

    // Recent coupons for manage coupons panel
    const recentCoupons = coupons.slice(0, 5);

    return res.json({
      metrics: {
        totalOrders,
        simulatedRevenue,
        totalCustomers,
        activeCoupons,
        currency: 'USD'
      },
      recentOrders,
      recentCoupons
    });
  } catch (err) {
    console.error('getOverview error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin overview.' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;
    let orders = await Orders.find();

    if (status) {
      orders = orders.filter(o => o.orderStatus === status);
    }
    if (paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === paymentStatus);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => 
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q)
      );
    }

    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Users.find();
    // Exclude password hashes for security
    const sanitized = customers.map(({ passwordHash, ...rest }) => rest);
    return res.json({ customers: sanitized });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch customers.' });
  }
};

export const getAdminVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicles.find();
    return res.json({ vehicles });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch vehicles.' });
  }
};

export const createAdminVehicle = async (req, res) => {
  try {
    const data = req.body;
    const newVehicle = await Vehicles.create({
      ...data,
      isDemoData: true
    });
    return res.status(201).json({ vehicle: newVehicle });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create vehicle.' });
  }
};

export const updateAdminVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Vehicles.findByIdAndUpdate(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Vehicle not found.' });
    return res.json({ vehicle: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update vehicle.' });
  }
};

export const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupons.find();
    return res.json({ coupons });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
};

export const createAdminCoupon = async (req, res) => {
  try {
    const { code, discountValue, discountType = 'percentage', expiresAt, description } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupons.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ error: 'Coupon with this code already exists.' });
    }

    const newCoupon = await Coupons.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      applicableVehicleIds: ['veh_roadster_standard'],
      expiresAt: expiresAt || '2026-12-31T23:59:59Z',
      isActive: true,
      isDemoOnly: true,
      maxUses: 1000,
      usageCount: 0,
      description: description || `${discountValue}% Concept Discount`
    });

    return res.status(201).json({ coupon: newCoupon });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create coupon.' });
  }
};

export const updateAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Coupons.findByIdAndUpdate(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Coupon not found.' });
    return res.json({ coupon: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update coupon.' });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const payments = await Payments.find();
    return res.json({ payments });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch payments.' });
  }
};

export const getReports = async (req, res) => {
  try {
    const orders = await Orders.find();
    
    // Group monthly or daily data for chart
    const dailyActivity = [
      { date: 'Oct 20', revenue: 160000, orders: 2 },
      { date: 'Oct 21', revenue: 80000, orders: 1 },
      { date: 'Oct 22', revenue: 240000, orders: 3 },
      { date: 'Oct 23', revenue: 80000, orders: 1 },
      { date: 'Oct 24', revenue: 181800, orders: 2 },
      { date: 'Oct 25', revenue: 80000, orders: 1 },
      { date: 'Oct 26', revenue: orders.filter(o => o.createdAt?.startsWith('2026-10-26') && o.paymentStatus === 'paid').reduce((acc, o) => acc + o.finalPrice, 0) || 80000, orders: 1 },
    ];

    return res.json({
      chartData: dailyActivity,
      summary: {
        avgOrderValue: 86450,
        conversionRate: '14.2%',
        totalSimulatedRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((a, b) => a + (b.finalPrice || 0), 0)
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

export const updateAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Orders.findByIdAndUpdate(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Order not found.' });
    return res.json({ order: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order.' });
  }
};

export const deleteAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Orders.findByIdAndDelete(id);
    return res.json({ message: 'Order deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete order.' });
  }
};

export const deleteAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupons.findByIdAndDelete(id);
    return res.json({ message: 'Coupon deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete coupon.' });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ _id: 'system_settings' });
    if (!settings) {
      settings = await Settings.create({
        _id: 'system_settings',
        btcAddress: 'bc1q8w7l5n9a4k2v0p8e3r7t6y1u2i3o4p5a6s7d',
        usdtTrc20Address: 'TYDzsXDikPf1PvhXiHGi8669Wqy3oh27Wk',
        usdtErc20Address: '0x71C8360f3E282352B492E8704D116496Eb36dC19',
        tawkPropertyId: '',
        tawkWidgetId: '',
        tawkDirectChatUrl: ''
      });
    }
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch settings.' });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const { btcAddress, usdtTrc20Address, usdtErc20Address, tawkPropertyId, tawkWidgetId, tawkDirectChatUrl } = req.body;
    let settings = await Settings.findOne({ _id: 'system_settings' });
    const updates = {
      ...(btcAddress !== undefined ? { btcAddress: btcAddress.trim() } : {}),
      ...(usdtTrc20Address !== undefined ? { usdtTrc20Address: usdtTrc20Address.trim() } : {}),
      ...(usdtErc20Address !== undefined ? { usdtErc20Address: usdtErc20Address.trim() } : {}),
      ...(tawkPropertyId !== undefined ? { tawkPropertyId: tawkPropertyId.trim() } : {}),
      ...(tawkWidgetId !== undefined ? { tawkWidgetId: tawkWidgetId.trim() } : {}),
      ...(tawkDirectChatUrl !== undefined ? { tawkDirectChatUrl: tawkDirectChatUrl.trim() } : {}),
      updatedAt: new Date().toISOString()
    };

    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, updates);
    } else {
      settings = await Settings.create({
        _id: 'system_settings',
        ...updates
      });
    }

    return res.json({ message: 'Settings updated successfully.', settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ _id: 'system_settings' });
    return res.json({
      btcAddress: settings?.btcAddress || 'bc1q8w7l5n9a4k2v0p8e3r7t6y1u2i3o4p5a6s7d',
      usdtTrc20Address: settings?.usdtTrc20Address || 'TYDzsXDikPf1PvhXiHGi8669Wqy3oh27Wk',
      usdtErc20Address: settings?.usdtErc20Address || '0x71C8360f3E282352B492E8704D116496Eb36dC19',
      tawkPropertyId: settings?.tawkPropertyId || '',
      tawkWidgetId: settings?.tawkWidgetId || '',
      tawkDirectChatUrl: settings?.tawkDirectChatUrl || ''
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch public settings.' });
  }
};
