import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { DATA_DIR, isMongoConnected } from '../config/db.js';

class FileCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  read() {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      console.error(`Error reading ${this.name}.json:`, e);
      return [];
    }
  }

  write(items) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error writing ${this.name}.json:`, e);
    }
  }

  async find(query = {}) {
    const items = this.read();
    return items.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = this.read();
    return items.find(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const items = this.read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const items = this.read();
    const newItem = {
      _id: data._id || 'doc_' + crypto.randomBytes(12).toString('hex'),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    items.unshift(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const [deleted] = items.splice(index, 1);
    this.write(items);
    return deleted;
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

/**
 * HybridStore
 * Routes database operations directly to MongoDB when MONGODB_URI is connected,
 * or seamlessly falls back to the robust local JSON file collection.
 */
class HybridStore {
  constructor(name) {
    this.name = name;
    this.fileStore = new FileCollection(name);
  }

  getMongoCollection() {
    if (isMongoConnected() && mongoose.connection.db) {
      return mongoose.connection.db.collection(this.name);
    }
    return null;
  }

  async find(query = {}) {
    const coll = this.getMongoCollection();
    if (coll) {
      return await coll.find(query).toArray();
    }
    return await this.fileStore.find(query);
  }

  async findOne(query = {}) {
    const coll = this.getMongoCollection();
    if (coll) {
      return (await coll.findOne(query)) || null;
    }
    return await this.fileStore.findOne(query);
  }

  async findById(id) {
    const coll = this.getMongoCollection();
    if (coll) {
      return (await coll.findOne({ $or: [{ _id: id }, { id: id }] })) || null;
    }
    return await this.fileStore.findById(id);
  }

  async create(data) {
    const coll = this.getMongoCollection();
    const newItem = {
      _id: data._id || 'doc_' + crypto.randomBytes(12).toString('hex'),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    if (coll) {
      await coll.insertOne(newItem);
      // Also keep file backup in sync
      try {
        const fileItems = this.fileStore.read();
        fileItems.unshift(newItem);
        this.fileStore.write(fileItems);
      } catch (e) {
        // Non-blocking file backup
      }
      return newItem;
    }

    return await this.fileStore.create(data);
  }

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    const coll = this.getMongoCollection();
    const updatedAt = new Date().toISOString();

    if (coll) {
      const updated = await coll.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { ...updates, updatedAt } },
        { returnDocument: 'after' }
      );
      // Keep file backup in sync
      try {
        await this.fileStore.findByIdAndUpdate(id, updates, options);
      } catch (e) {
        // Non-blocking
      }
      return updated || null;
    }

    return await this.fileStore.findByIdAndUpdate(id, updates, options);
  }

  async findByIdAndDelete(id) {
    const coll = this.getMongoCollection();
    if (coll) {
      const deleted = await coll.findOneAndDelete({ $or: [{ _id: id }, { id: id }] });
      try {
        await this.fileStore.findByIdAndDelete(id);
      } catch (e) {
        // Non-blocking
      }
      return deleted || null;
    }
    return await this.fileStore.findByIdAndDelete(id);
  }

  async countDocuments(query = {}) {
    const coll = this.getMongoCollection();
    if (coll) {
      return await coll.countDocuments(query);
    }
    return await this.fileStore.countDocuments(query);
  }
}

// Collections required by the platform
export const Users = new HybridStore('users');
export const Vehicles = new HybridStore('vehicles');
export const Coupons = new HybridStore('coupons');
export const Orders = new HybridStore('orders');
export const Payments = new HybridStore('payments');
export const Notifications = new HybridStore('notifications');
export const Settings = new HybridStore('settings');
export const PendingRegistrations = new HybridStore('pending_registrations');
export const OtpVerifications = new HybridStore('otp_verifications');
