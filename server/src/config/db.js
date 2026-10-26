import mongoose from 'mongoose';

import { mongodbUri } from './env.js';

/**
 * Connects to MongoDB. Listeners are registered before connecting so that
 * later connection drops/hiccups are logged rather than silently ignored.
 */
export async function connectToDatabase() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log('[db] MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  try {
    await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    throw new Error(
      `Unable to connect to MongoDB: ${err?.message ?? err}. Verify that MongoDB is running and MONGODB_URI is correct.`,
    );
  }

  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

/** 1 === connected (mongoose readyState) */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
