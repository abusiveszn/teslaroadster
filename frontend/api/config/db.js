import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import dns from 'dns';

// Fix Windows Node.js querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom DNS resolution not supported
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export let isUsingMongo = false;

export const isMongoConnected = () => isUsingMongo && mongoose.connection.readyState === 1;

export const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI?.trim();

  // If MONGODB_USERNAME and MONGODB_PASSWORD are provided, assemble or fix URI
  if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
    const user = process.env.MONGODB_USERNAME.trim();
    const pass = process.env.MONGODB_PASSWORD.trim();
    if (!mongoUri || mongoUri.includes(':t@') || mongoUri.includes(':<password>@')) {
      const cluster = mongoUri && mongoUri.includes('@')
        ? mongoUri.split('@')[1].replace(/^[^\w.-]+/, '')
        : 'teslaroadster.gsvhapd.mongodb.net';
      mongoUri = `mongodb+srv://${user}:${encodeURIComponent(pass)}@${cluster}`;
      if (!mongoUri.includes('/tesla_roadster')) {
        mongoUri = mongoUri.split('?')[0].replace(/\/+$/, '') + '/tesla_roadster?retryWrites=true&w=majority';
      }
    }
  }

  if (mongoUri && mongoUri.trim()) {
    try {
      console.log(`[Database] Attempting connection to MongoDB...`);
      const conn = await mongoose.connect(mongoUri.trim(), {
        serverSelectionTimeoutMS: 6000,
      });
      isUsingMongo = true;
      console.log(`[Database] ✅ Connected successfully to MongoDB: ${conn.connection.host} (DB: ${conn.connection.name || 'tesla_roadster'})`);
      return;
    } catch (err) {
      console.warn(`[Database] ⚠️ MongoDB connection failed (${err.message}).`);
      if (err.message.includes('authentication failed')) {
        console.warn(`[Database] 💡 Authentication failed: Check your MongoDB Atlas Database Username & Password in Database Access.`);
      } else if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED')) {
        console.warn(`[Database] 💡 DNS/Network: Whitelist IP 0.0.0.0/0 under Network Access in MongoDB Atlas.`);
      }
      console.warn(`[Database] Falling back to robust persistent JSON file store.`);
    }
  } else {
    console.log('[Database] MONGODB_URI is not set. Operating in local JSON file store mode.');
  }

  // Ensure data directory exists for JSON fallback
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  isUsingMongo = false;
  console.log(`[Database] Using persistent JSON file store in ${DATA_DIR}`);
};

export { DATA_DIR };
