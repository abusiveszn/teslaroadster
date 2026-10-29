import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getPublicSettings } from './controllers/adminController.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const backendEnv = path.resolve(__dirname, '../.env');
const rootEnv = path.resolve(__dirname, '../../.env');
if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Standard Application Middlewares

// Ensure DB is connected before handling any incoming request (critical for Vercel Serverless)
let dbPromise = null;
app.use(async (req, res, next) => {
  try {
    if (!dbPromise) {
      dbPromise = connectDB().then(() => seedDatabase()).catch(err => {
        console.error('[DB Init Error]', err);
      });
    }
    await dbPromise;
    next();
  } catch (err) {
    next(err);
  }
});

// Routes (support both /api/ prefix and bare paths for Vercel Serverless)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/vehicles', '/vehicles'], vehicleRoutes);
app.use(['/api/coupons', '/coupons'], couponRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/payments', '/payments'], paymentRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.get(['/api/settings', '/settings'], getPublicSettings);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'simulation_demo',
    timestamp: new Date().toISOString()
  });
});

// JSON 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Startup sequence
const startServer = async () => {
  try {
    if (!dbPromise) {
      dbPromise = connectDB().then(() => seedDatabase());
    }
    await dbPromise;
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Tesla Roadster Pre-Sale Server running on http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

export default app;
