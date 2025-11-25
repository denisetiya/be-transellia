import { PrismaClient } from '../generated/prisma';
import logger from '../lib/lib.logger';

// Ensure DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

// Create Prisma client with optimized settings for serverless environments
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // For Vercel/serverless environments, we can use adapter approach
  // But first let's try without adapter for simplicity
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected');
  process.exit(0);
});

export { prisma };
export default prisma;