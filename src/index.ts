import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import appRouter from './app.routes';
import env from './config/env.config';
import logger from './lib/lib.logger';
import GlobalErrorHandler from './lib/lib.error.handler';
import AdminService from './modules/admin/admin.service';
import { connectDatabase } from './config/database';


// Import type extensions to ensure they are loaded
import './middleware/middleware.types';

const app: Application = express();

// Essential middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Parse URL-encoded bodies

// CORS middleware (if needed)
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = env.CORS_ORIGINS.split(',');
  const origin = req.headers.origin;
  
  // Handle both HTTP and HTTPS origins
  if (allowedOrigins.includes(origin || '')) {
    res.header('Access-Control-Allow-Origin', origin || '');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Add security headers for HTTPS
  if (req.protocol === 'https') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
  }
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/v1', appRouter);

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Transellia Backend API', 
    version: '1.0.0', 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
// This should be the last middleware registered
app.use(GlobalErrorHandler.expressErrorHandler);

// Initialize admin user (async operation)
const initializeAdmin = async () => {
  try {
    const result = await AdminService.initializeAdmin();
    if (result.success) {
      logger.info(`Admin initialization: ${result.message}`);
      if (result.adminCreated) {
        logger.info('New admin user was created from environment variables');
      }
    } else {
      logger.error(`Admin initialization failed: ${result.message}`);
    }
  } catch (error) {
    logger.error(`Admin initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Connect to Couchbase then start server
  connectDatabase().then(() => {
    app.listen(env.PORT, async () => {
      logger.info(`Server is running on http://localhost:${env.PORT}`);
      
      // Initialize admin after server starts
      await initializeAdmin();
    });
  }).catch((error) => {
    logger.error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  });
} else {
  // For Vercel/serverless environments, connect to database and initialize admin on module load
  connectDatabase().then(() => {
    initializeAdmin();
  }).catch((error) => {
    logger.error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  });
}

// Export app for Vercel
export default app;
