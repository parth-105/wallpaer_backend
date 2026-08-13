import mongoose from 'mongoose';
import { env } from './env.js';
import { AdminModel } from '../models/Admin.js';

mongoose.set('strictQuery', true);

// Auto-seed default admin user if database is empty
async function ensureDefaultAdmin(): Promise<void> {
  try {
    const adminCount = await AdminModel.countDocuments();
    if (adminCount === 0) {
      const email = process.env.ADMIN_EMAIL || 'admin@wallpaper.com';
      const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
      await AdminModel.create({ email, password, role: 'admin' });
      console.log(`[Auto-Seed] Default Admin account created: ${email}`);
    }
  } catch (err) {
    console.error('[Auto-Seed] Failed to check or seed admin:', err);
  }
}

// Cache connection for serverless environments (like Vercel)
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  // Check if already connected (readyState: 1 = connected)
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start new connection
  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        // Optimize for serverless
        maxPoolSize: 1, // Limit connection pool in serverless
        minPoolSize: 1,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });

      // Ensure default admin user exists
      await ensureDefaultAdmin();

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        connectionPromise = null; // Allow retry on error
      });

      mongoose.connection.on('disconnected', () => {
        connectionPromise = null; // Allow reconnection
      });

      return conn;
    } catch (error) {
      connectionPromise = null; // Reset on error to allow retry
      console.error('MongoDB connection error', error);
      throw error;
    }
  })();

  return connectionPromise;
}

