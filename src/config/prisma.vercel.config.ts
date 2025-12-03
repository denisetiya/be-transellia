import { PrismaClient } from '../generated/prisma';
import logger from '../lib/lib.logger';

// Vercel-optimized Prisma client configuration
class VercelPrismaClient {
  private static instance: PrismaClient | null = null;

  public static getInstance(): PrismaClient {
    if (!VercelPrismaClient.instance) {
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not defined');
      }

      // Log connection details for debugging (without exposing credentials)
      const urlObj = new URL(databaseUrl);
      const maskedUrl = `${urlObj.protocol}//${urlObj.username ? '***:***@' : ''}${urlObj.host}${urlObj.pathname}`;
      logger.info(`Vercel Prisma: Database connection configured: ${maskedUrl}`);
      logger.info(`Vercel Prisma: Environment: ${process.env.NODE_ENV}`);
      logger.info(`Vercel Prisma: Region: ${process.env.VERCEL_REGION || 'Unknown'}`);

      VercelPrismaClient.instance = new PrismaClient({
        log: ['error', 'warn'], // Reduced logging for production
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        // Vercel-specific optimizations
        errorFormat: 'minimal',
      });

      // Handle graceful shutdown for Vercel
      if (typeof process !== 'undefined') {
        process.on('beforeExit', async () => {
          if (VercelPrismaClient.instance) {
            await VercelPrismaClient.instance.$disconnect();
            VercelPrismaClient.instance = null;
          }
        });
      }
    }

    return VercelPrismaClient.instance;
  }
}

// Export the singleton instance
export const vercelPrisma = VercelPrismaClient.getInstance();
export default vercelPrisma;