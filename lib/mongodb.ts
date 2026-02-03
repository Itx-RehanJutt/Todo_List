import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoUri: string = process.env.MONGODB_URI || '';

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        cached.conn = mongoose;
        return mongoose;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
