import bcrypt from 'bcryptjs';
import { Users, Vehicles, Coupons, Orders, Payments, Notifications } from '../models/store.js';

export const seedDatabase = async () => {
  console.log('[Seed] Seeding database with initial data...');

  // 1. Seed Admin & Customer Users
  const adminPasswordHash = await bcrypt.hash('Tesla@admin', 10);
  const customerPasswordHash = await bcrypt.hash('Password123!', 10);

  const existingAdmin = await Users.findOne({ email: 'teslasupporttech@gmail.com' });
  let adminId = existingAdmin?._id;
  if (!existingAdmin) {
    const admin = await Users.create({
      _id: 'usr_admin_001',
      fullName: 'Tesla Operations Admin',
      email: 'teslasupporttech@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      emailVerified: true,
      createdAt: new Date().toISOString()
    });
    adminId = admin._id;
  }

  const existingCustomer = await Users.findOne({ email: 'john.doe@example.com' });
  let customerId = existingCustomer?._id;
  if (!existingCustomer) {
    const customer = await Users.create({
      _id: 'usr_customer_001',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      emailVerified: true,
      createdAt: '2026-10-20T10:00:00Z'
    });
    customerId = customer._id;
  }

  // 2. Seed Vehicles
  const existingVehicles = await Vehicles.find();
  let vehicleId = existingVehicles[0]?._id;
  if (existingVehicles.length === 0) {
    const v1 = await Vehicles.create({
      _id: 'veh_roadster_standard',
      name: 'Tesla Roadster',
      model: 'Roadster 2026',
      description: 'The quickest car in the world, with record-setting acceleration, range and performance. Official pre-sale reservation.',
      imageUrls: [
        '/images/roadster-red.jpg',
        '/images/roadster-black.jpg',
        '/images/roadster-white.jpg',
        '/images/roadster-silver.jpg',
        '/images/roadster-blue.jpg',
        '/images/roadster-rear.jpg',
        '/images/roadster-interior.jpg',
        '/images/roadster-banner.jpg'
      ],
      illustrativePrice: 200000,
      currency: 'USD',
      specs: {
        acceleration: '1.9s',
        accelerationLabel: '0-60 mph',
        range: '620 mi',
        rangeLabel: 'Range',
        topSpeed: '250+ mph',
        power: '1,250 hp',
        powerLabel: 'Power',
        drive: 'All-Wheel Drive (Tri-Motor)'
      },
      configurations: {
        colors: [
          { id: 'red', name: 'Ultra Deep Red', hex: '#E82127', image: '/images/roadster-red.jpg', priceDelta: 0 },
          { id: 'black', name: 'Solid Midnight Black', hex: '#0a0a0c', image: '/images/roadster-black.jpg', priceDelta: 0 },
          { id: 'white', name: 'Pearl White Multi-Coat', hex: '#f8f9fa', image: '/images/roadster-white.jpg', priceDelta: 0 },
          { id: 'silver', name: 'Quicksilver Metallic', hex: '#8a8d91', image: '/images/roadster-silver.jpg', priceDelta: 0 },
          { id: 'blue', name: 'Deep Blue Metallic', hex: '#0047AB', image: '/images/roadster-blue.jpg', priceDelta: 0 }
        ],
        wheels: [
          { id: 'aero', name: '21" Turbofan Carbon Wheels', priceDelta: 0 },
          { id: 'sport', name: '22" Track Sport Forged Wheels', priceDelta: 4500 }
        ],
        interiors: [
          { id: 'carbon-black', name: 'Black Sport Alcantara & Carbon', hex: '#18181c', priceDelta: 0 },
          { id: 'white-minimalist', name: 'Pure White Ultra Leather', hex: '#ededed', priceDelta: 2000 }
        ],
        packages: [
          { id: 'standard', name: 'Base Roadster Supercar', price: 200000, description: 'Standard 1.9s 0-60 acceleration, 620 mi range' },
          { id: 'founders', name: 'Founders Series Limited Edition', price: 250000, description: 'Numbered chassis series 1-1,000, custom door sill badge' },
          { id: 'spacex', name: 'SpaceX Thruster Package', price: 280000, description: 'Cold gas thrusters around car for sub-1.1s acceleration' }
        ]
      },
      availability: 'Reservation Open',
      isDemoData: false
    });
    vehicleId = v1._id;
  }

  // 3. Seed Coupons
  const existingCoupons = await Coupons.find();
  if (existingCoupons.length === 0) {
    await Coupons.create({
      _id: 'cpn_roadmonster',
      code: 'ROADMONSTER',
      discountType: 'percentage',
      discountValue: 60,
      applicableVehicleIds: ['veh_roadster_standard'],
      startsAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T23:59:59Z',
      maxUses: 5000,
      usageCount: 0,
      isActive: true,
      isDemoOnly: true,
      description: 'Exclusive 60% ROADMONSTER Special Reservation Discount'
    });

    await Coupons.create({
      _id: 'cpn_roadster60',
      code: 'ROADSTER60',
      discountType: 'percentage',
      discountValue: 60,
      applicableVehicleIds: ['veh_roadster_standard'],
      startsAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T23:59:59Z',
      maxUses: 5000,
      usageCount: 48,
      isActive: true,
      isDemoOnly: true,
      description: 'Exclusive 60% Demonstration Discount for simulated checkout'
    });

    await Coupons.create({
      _id: 'cpn_vip20',
      code: 'VIP20',
      discountType: 'percentage',
      discountValue: 20,
      applicableVehicleIds: ['veh_roadster_standard'],
      startsAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T23:59:59Z',
      maxUses: 1000,
      usageCount: 12,
      isActive: true,
      isDemoOnly: true,
      description: '20% VIP Concept Pre-Order Discount'
    });
  }

  // 4. Seed Orders
  const existingOrders = await Orders.find();
  if (existingOrders.length === 0) {
    // Initial order from the UI reference image: #TRD-20261025-001
    const order1 = await Orders.create({
      _id: 'ord_demo_001',
      orderNumber: '#TRD-20261025-001',
      userId: customerId,
      customerEmail: 'john.doe@example.com',
      customerName: 'John Doe',
      vehicleId: vehicleId,
      vehicleName: 'Tesla Roadster',
      selectedConfiguration: {
        color: 'Ultra Deep Red',
        wheel: '21" Turbofan Carbon Wheels',
        interior: 'Black Sport Alcantara & Carbon',
        package: 'Base Roadster Supercar'
      },
      originalPrice: 200000,
      discountAmount: 120000,
      finalPrice: 80000,
      currency: 'USD',
      couponCode: 'ROADSTER60',
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      isDemoOrder: true,
      paymentMethod: 'Credit / Debit Card',
      createdAt: '2026-10-25T14:30:00Z',
      updatedAt: '2026-10-25T14:32:00Z'
    });

    await Payments.create({
      _id: 'pay_demo_001',
      orderId: order1._id,
      orderNumber: '#TRD-20261025-001',
      userId: customerId,
      provider: 'Credit / Debit Card (Simulated)',
      providerReference: 'SIM-CARD-89214798',
      amount: 80000,
      currency: 'USD',
      status: 'success',
      isTestPayment: true,
      verifiedAt: '2026-10-25T14:32:00Z',
      createdAt: '2026-10-25T14:31:00Z'
    });

    // Add 2 more sample historical orders for admin metrics and realistic analytics
    const order2 = await Orders.create({
      _id: 'ord_demo_002',
      orderNumber: '#TRD-20261024-002',
      userId: customerId,
      customerEmail: 'sarah.connor@example.com',
      customerName: 'Sarah Connor',
      vehicleId: vehicleId,
      vehicleName: 'Tesla Roadster Founders',
      selectedConfiguration: {
        color: 'Solid Midnight Black',
        wheel: '22" Track Sport Forged Wheels',
        interior: 'Black Sport Alcantara & Carbon',
        package: 'Founders Series Limited Edition'
      },
      originalPrice: 254500,
      discountAmount: 152700,
      finalPrice: 101800,
      currency: 'USD',
      couponCode: 'ROADSTER60',
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      isDemoOrder: true,
      paymentMethod: 'Paystack (Simulated)',
      createdAt: '2026-10-24T09:15:00Z',
      updatedAt: '2026-10-24T09:17:00Z'
    });

    await Payments.create({
      _id: 'pay_demo_002',
      orderId: order2._id,
      orderNumber: '#TRD-20261024-002',
      userId: customerId,
      provider: 'Paystack (Simulated)',
      providerReference: 'PSTK-TEST-771923',
      amount: 101800,
      currency: 'USD',
      status: 'success',
      isTestPayment: true,
      verifiedAt: '2026-10-24T09:17:00Z',
      createdAt: '2026-10-24T09:16:00Z'
    });

    // 5. Seed Customer Notifications
    await Notifications.create({
      _id: 'notif_001',
      userId: customerId,
      type: 'payment_success',
      subject: 'Payment Confirmed (#TRD-20261025-001)',
      message: 'Your simulated pre-sale order for the Tesla Roadster has been recorded. Amount: $80,000.',
      readAt: null,
      createdAt: '2026-10-25T14:32:00Z'
    });

    await Notifications.create({
      _id: 'notif_002',
      userId: customerId,
      type: 'system',
      subject: 'Welcome to the Roadster Pre-Sale Demo',
      message: 'Explore your pre-order status, download simulated receipts, or configure additional options.',
      readAt: null,
      createdAt: '2026-10-25T14:33:00Z'
    });
  }

  console.log('[Seed] Database initialization complete!');
};

if (process.argv[1]?.includes('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
