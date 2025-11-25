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
  
  // Configuration yang konsisten untuk development dan production
  const connectionConfig = {
    // Gunakan single connection untuk semua environment (cocok untuk serverless)
    max: 1, // Single connection untuk mencegah connection pool exhaustion
    idle_timeout: 5, // Idle timeout yang lebih singkat
    connect_timeout: 10, // Connect timeout dalam detik
    
    // Opsi tambahan untuk serverless environments
    prepare: false, // Disable prepared statements untuk compatibility yang lebih baik
    max_lifetime: 30, // Connection lifetime dalam detik
    
    // SSL configuration untuk semua environment (keamanan lebih baik)
    ssl: { rejectUnauthorized: false },
    
    // Callback untuk connection errors
    onnotice: (notice: unknown) => {
      logger.warn(`Database notice: ${notice}`);
    },
  };
  
  try {
    const client = postgres(connectionString, connectionConfig);
    logger.info('Database client created successfully');
    return client;
  } catch (error) {
    logger.error(`Failed to create database client: ${error instanceof Error ? error.message : 'Unknown error'}`);
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