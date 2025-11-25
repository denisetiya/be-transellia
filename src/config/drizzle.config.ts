import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

// Ensure DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

// Create postgres client
const client = postgres(databaseUrl);

// Create and export drizzle instance with schema
export const db = drizzle(client, { schema });

// Export the schema for convenience
export * from '../db/schema';