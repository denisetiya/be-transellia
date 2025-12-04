import AdminService from '../src/modules/admin/admin.service';
import logger from '../src/lib/lib.logger';
import prisma from '../src/config/prisma.config';

async function seedAdmin() {
  try {
    logger.info('Starting admin seed process...');
    
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Initialize admin user
    const result = await AdminService.initializeAdmin();
    
    if (result.success) {
      logger.info(`Admin seed completed: ${result.message}`);
      if (result.adminCreated) {
        logger.info('New admin user was created');
      }
    } else {
      logger.error(`Admin seed failed: ${result.message}`);
    }
    
  } catch (error) {
    logger.error(`Admin seed error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  } finally {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      logger.info('Admin seed process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Admin seed process failed: ${error}`);
      process.exit(1);
    });
}

export default seedAdmin;