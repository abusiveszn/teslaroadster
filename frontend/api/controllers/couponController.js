import { Coupons, Vehicles } from '../models/store.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, vehicleId, packageId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupons.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid discount coupon code.' 
      });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ 
        valid: false, 
        error: 'This coupon has expired.' 
      });
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Coupon usage limit has been reached.' 
      });
    }

    // Fetch vehicle from database if provided to calculate server-side amount
    let originalPrice = 200000;
    if (vehicleId) {
      const vehicle = await Vehicles.findById(vehicleId);
      if (vehicle) {
        if (packageId && vehicle.configurations?.packages) {
          const pkg = vehicle.configurations.packages.find(p => p.id === packageId);
          if (pkg) originalPrice = pkg.price;
          else originalPrice = vehicle.illustrativePrice || 200000;
        } else {
          originalPrice = vehicle.illustrativePrice || 200000;
        }
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((originalPrice * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(originalPrice, coupon.discountValue);
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return res.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        isDemoOnly: true,
      },
      calculation: {
        originalPrice,
        discountAmount,
        finalPrice,
        percentageOff: coupon.discountType === 'percentage' ? coupon.discountValue : Math.round((discountAmount / originalPrice) * 100),
        currency: 'USD'
      },
      message: `✓ ${coupon.discountValue}% Discount Applied!`
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    return res.status(500).json({ error: 'Failed to validate coupon.' });
  }
};
