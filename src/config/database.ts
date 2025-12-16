import mongoose from 'mongoose';
import env from './env.config';
import logger from '../lib/lib.logger';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    logger.warn('MongoDB already connected');
    return;
  }

  try {
    logger.info('Connecting to MongoDB...');
    
    await mongoose.connect(env.MONGODB_URI);
    
    isConnected = true;
    logger.info('Successfully connected to MongoDB');
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    try {
      await mongoose.disconnect();
      isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error(`Failed to disconnect from MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

// For serverless environments like Vercel
export function getConnectionState(): number {
  return mongoose.connection.readyState;
}
