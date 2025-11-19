import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import appRouter from './app.routes';
import env from './config/env.config';
import logger from './lib/lib.logger';
import GlobalErrorHandler from './lib/lib.error.handler';
// Import type extensions to ensure they are loaded
import './middleware/middleware.types';

const app: Application = express();

// Essential middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Parse URL-encoded bodies

// CORS middleware (if needed)
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin || '')) {
    res.header('Access-Control-Allow-Origin', origin || '');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(env.PORT, () => {
    logger.info(`Server is running on http://localhost:${env.PORT}`);
  });
}
// Export app for Vercel
export default app;
