import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

// Ensure DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

// Create postgres client with additional options for better compatibility
const client = postgres(databaseUrl, {
  max: 1, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create and export drizzle instance with schema
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export the schema for convenience
export * from '../db/schema';