import mongoose from 'mongoose';
import config from '../config/index.js';

let isConnected = false;

export async function connectDatabase() {
  if (!config.hasDatabase) {
    console.log('📦 Running with in-memory storage (no DATABASE_URL configured)');
    return false;
  }

  try {
    await mongoose.connect(config.databaseUrl, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('📦 Falling back to in-memory storage');
    return false;
  }
}

export function isDatabaseConnected() {
  return isConnected;
}

export async function disconnectDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
