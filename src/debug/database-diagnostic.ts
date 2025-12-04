import { PrismaClient } from '../generated/prisma';
import logger from '../lib/lib.logger';

const prisma = new PrismaClient();

async function diagnoseDatabase() {
  logger.info('=== DATABASE DIAGNOSTIC START ===');
  
  try {
    // Test database connection
    logger.info('Testing database connection...');
    await prisma.$connect();
    logger.info('✅ Database connection successful');
    
    // Check if tables exist
    logger.info('Checking database tables...');
    
    try {
      // Try to query the users table
      const userCount = await prisma.user.count();
      logger.info(`✅ Users table exists with ${userCount} records`);
    } catch (error: any) {
      logger.error(`❌ Users table issue: ${error.message}`);
      
      // Check if the table exists at all
      try {
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`;
        logger.info(`Table query result: ${JSON.stringify(result)}`);
        
        if (Array.isArray(result) && result.length === 0) {
          logger.error('❌ Users table does not exist in the database');
        }
      } catch (queryError: any) {
        logger.error(`❌ Error checking table existence: ${queryError.message}`);
      }
    }
    
    // List all tables in the database
    logger.info('Listing all tables in the database...');
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    logger.info(`Available tables: ${JSON.stringify(tables)}`);
    
    // Check migration status
    logger.info('Checking migration status...');
    try {
      const migrations = await prisma.$queryRaw`SELECT * FROM _prisma_migrations ORDER BY started_at DESC`;
      logger.info(`Migration history: ${JSON.stringify(migrations)}`);
    } catch (migrationError: any) {
      logger.error(`❌ Error checking migration status: ${migrationError.message}`);
    }
    
  } catch (error: any) {
    logger.error(`❌ Database diagnostic failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
    logger.info('=== DATABASE DIAGNOSTIC END ===');
  }
}

// Run the diagnostic if this file is executed directly
if (require.main === module) {
  diagnoseDatabase().catch(console.error);
}

export { diagnoseDatabase };