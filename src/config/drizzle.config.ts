// Import the enhanced database connection
import { db as database, type Database } from './db-connection';

// Re-export the database instance and types
export const db = database;
export type { Database };

export default db;