import { PrismaClient } from '../generated/prisma';
import logger from '../lib/lib.logger';

// Ensure DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

// Global variable to prevent multiple Prisma instances in serverless environments
declare global {
  var __prisma: PrismaClient | undefined;
}

// Use Vercel-optimized configuration when deployed on Vercel
let prisma: PrismaClient;

if (process.env.VERCEL === '1') {
  // Import Vercel-optimized configuration
  const { vercelPrisma } = require('./prisma.vercel.config');
  prisma = vercelPrisma;
  logger.info('Using Vercel-optimized Prisma configuration');
} else {
  // Standard configuration for local development
  prisma = globalThis.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  // In development, save the Prisma client to global to avoid multiple instances
  if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
  }

  // Log connection details for debugging (without exposing credentials)
  const urlObj = new URL(databaseUrl);
  const maskedUrl = `${urlObj.protocol}//${urlObj.username ? '***:***@' : ''}${urlObj.host}${urlObj.pathname}`;
  logger.info(`Database connection configured: ${maskedUrl}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
}

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