import express,{ type Application } from 'express';
import appRouter from './app.routes';
import env from './config/env.config';
import logger from './lib/lib.logger';

const app: Application = express();

// Essential middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Parse URL-encoded bodies

// CORS middleware (if needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/v1', appRouter);

app.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
});

