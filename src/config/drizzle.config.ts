import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

// Create postgres client with connection pooling
const connectionString = process.env.DATABASE_URL || '';

// For production, you might want to add more configuration options
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Idle timeout in seconds
  connect_timeout: 10, // Connect timeout in seconds
});

// Create drizzle instance with schema
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development' ? true : false
});

// Export types for convenience
export type Database = typeof db;

export default db;