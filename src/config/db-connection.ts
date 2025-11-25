import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import logger from '../lib/lib.logger';

// Validate database URL
function validateDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    const error = 'DATABASE_URL environment variable is not set';
    logger.error(error);
    throw new Error(error);
  }
  
  // Basic URL validation
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    const error = 'DATABASE_URL must be a valid PostgreSQL connection string';
    logger.error(error);
    throw new Error(error);
  }
  
  return url;
}

// Create connection with retry logic
function createConnection() {
  const connectionString = validateDatabaseUrl();
  
  logger.info(`Initializing database connection in ${process.env.NODE_ENV} mode`);
  logger.info(`Database URL (masked): ${connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  // Configuration yang konsisten untuk development dan production
  const connectionConfig = {
    // Optimized untuk Vercel serverless environment
    max: process.env.NODE_ENV === 'production' ? 1 : 1, // Force single connection for serverless
    idle_timeout: process.env.NODE_ENV === 'production' ? 2 : 5, // Very short timeout for production
    connect_timeout: 10, // Connect timeout dalam detik
    
    // Opsi tambahan untuk serverless environments
    prepare: false, // Disable prepared statements untuk compatibility yang lebih baik
    max_lifetime: process.env.NODE_ENV === 'production' ? 10 : 30, // Very short lifetime for production
    
    // Disable query caching untuk mencegah issues di serverless
    cache: false,
    
    // SSL configuration untuk semua environment (keamanan lebih baik)
    ssl: { rejectUnauthorized: false },
    
    // Callback untuk connection errors
    onnotice: (notice: unknown) => {
      logger.warn(`Database notice: ${notice}`);
    },
    
    // Add debug callback for connection events
    onparameter: (key: string, value: unknown) => {
      logger.info(`Database parameter: ${key} = ${value}`);
    },
    
    // Add connection lifecycle logging for debugging
    onconnect: () => {
      logger.info('New database connection established');
    },
    
    onend: () => {
      logger.info('Database connection ended');
    },
  };
  
  try {
    logger.info(`Creating postgres client with config: ${JSON.stringify({
      ...connectionConfig,
      // Mask sensitive connection string info
      ssl: connectionConfig.ssl ? 'enabled' : 'disabled'
    }, null, 2)}`);
    
    const client = postgres(connectionString, connectionConfig);
    logger.info('Database client created successfully');
    
    // Test connection immediately with detailed logging
    logger.info('Testing database connection...');
    const startTime = Date.now();
    
    client`SELECT version(), now() as timestamp, inet_server_addr() as server_ip`
      .then(result => {
        const endTime = Date.now();
        const connectionTime = endTime - startTime;
        
        logger.info(`Database connection test successful:`);
        logger.info(`  - Connection time: ${connectionTime}ms`);
        logger.info(`  - Server version: ${result[0]?.version}`);
        logger.info(`  - Server timestamp: ${result[0]?.timestamp}`);
        logger.info(`  - Server IP: ${result[0]?.server_ip}`);
        logger.info(`  - Query timestamp: ${new Date().toISOString()}`);
      })
      .catch(error => {
        const endTime = Date.now();
        const connectionTime = endTime - startTime;
        
        logger.error(`Database connection test failed after ${connectionTime}ms:`);
        logger.error(`  - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        logger.error(`  - Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
        logger.error(`  - Query timestamp: ${new Date().toISOString()}`);
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            logger.error(`  - This appears to be a connection timeout issue`);
          }
          if (error.message.includes('ECONNREFUSED')) {
            logger.error(`  - This appears to be a connection refused issue`);
          }
          if (error.message.includes('ENOTFOUND')) {
            logger.error(`  - This appears to be a DNS resolution issue`);
          }
        }
      });
    
    return client;
  } catch (error) {
    logger.error(`Failed to create database client:`);
    logger.error(`  - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logger.error(`  - Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
    logger.error(`  - Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
    logger.error(`  - Connection config: ${JSON.stringify({
      ...connectionConfig,
      // Mask sensitive connection string info
      ssl: connectionConfig.ssl ? 'enabled' : 'disabled'
    }, null, 2)}`);
    logger.error(`  - Query timestamp: ${new Date().toISOString()}`);
    throw error;
  }
}

// Create the client
let client: ReturnType<typeof postgres> | null = null;

// Singleton pattern for database connection
export function getDatabaseClient() {
  if (!client) {
    client = createConnection();
  }
  return client;
}

// Create drizzle instance with schema
export const db = drizzle(getDatabaseClient(), { 
  schema,
  logger: process.env.NODE_ENV === 'development' ? true : false
});

// Export types for convenience
export type Database = typeof db;

// Function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = getDatabaseClient();
    await client`SELECT NOW()`;
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error(`Database connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  if (client) {
    try {
      await client.end();
      logger.info('Database connection closed successfully');
      client = null;
    } catch (error) {
      logger.error(`Error closing database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default db;