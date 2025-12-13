import { Cluster, connect, Bucket, Collection, ConnectOptions } from 'couchbase';
import env from './env.config';
import logger from '../lib/lib.logger';

// Shared Cluster instance
let cluster: Cluster | null = null;
let bucket: Bucket | null = null;

// Only one bucket is used for this application
const BUCKET_NAME = env.COUCHBASE_BUCKET;

export async function connectDatabase(): Promise<void> {
  if (cluster) {
    logger.warn('Couchbase cluster already connected');
    return;
  }

  try {
    logger.info(`Connecting to Couchbase at ${env.COUCHBASE_URL}, bucket: ${BUCKET_NAME}...`);
    
    // Connect to cluster
    cluster = await connect(env.COUCHBASE_URL, {
      username: env.COUCHBASE_USERNAME,
      password: env.COUCHBASE_PASSWORD,
    } as ConnectOptions);

    // Get bucket reference
    bucket = cluster.bucket(BUCKET_NAME);
    
    // In SDK 4.x, we usually wait for connection to be ready if needed, 
    // but the connect() call itself establishes the initial connection.
    // For specific bucket readiness, we can check basic ops or ping.
    
    logger.info('Successfully connected to Couchbase cluster and bucket');
  } catch (error) {
    logger.error(`Failed to connect to Couchbase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (cluster) {
    try {
      await cluster.close();
      cluster = null;
      bucket = null;
      logger.info('Disconnected from Couchbase database');
    } catch (error) {
      logger.error(`Failed to disconnect from Couchbase: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

// Helper to get the default collection
export function getCollection(collectionName: string = '_default'): Collection {
  if (!cluster || !bucket) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  
  // For now we use the default scope. 
  // If you use scopes, get scope first: bucket.scope('myscope').collection(collectionName)
  // For default collection in default scope:
  if (collectionName === '_default') {
      return bucket.defaultCollection();
  }
  
  // If we decided to use named collections in the default scope (Optional, usually good for separating types)
  // For this migration, we will stick to a single collection strategy or named collections based on "type" field distinction?
  // Ottoman used a single bucket and likely used `_type` field or named collections if configured.
  // Standard simplified pattern: Use default collection and a `type` field in documents.
  // BUT the user might want collections. 
  // Let's assume we use the *Default Collection* for everything for simplicity and "type" discriminator 
  // UNLESS the user explicitly asked for scopes.
  // Ottoman default is usually one collection or named collections. 
  // Let's stick to Default Collection for now to minimize complexity, 
  // matching the `collection.upsert` behavior in the test script.
  
  return bucket.defaultCollection(); 
}

// Helper to access the Cluster object directly if needed
export function getCluster(): Cluster {
  if (!cluster) {
    throw new Error('Database not connected');
  }
  return cluster;
}

// Re-export types from Models (to be created) implies we don't need to export them here anymore.
// We will separate Models into their own files again OR keep them here? 
// The plan said "Implement Model Repositories".
// So we should NOT export models from here anymore.
