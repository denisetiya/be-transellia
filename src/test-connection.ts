import { connect } from 'couchbase';
import env from './config/env.config';

async function main() {
  console.log('Testing direct Couchbase SDK connection...');
  console.log(`URL: ${env.COUCHBASE_URL}`);
  console.log(`Bucket: ${env.COUCHBASE_BUCKET}`);
  
  try {
    const cluster = await connect(env.COUCHBASE_URL, {
      username: env.COUCHBASE_USERNAME,
      password: env.COUCHBASE_PASSWORD,
    });
    
    console.log('Connected to cluster');
    
    const bucket = cluster.bucket(env.COUCHBASE_BUCKET);
    console.log('Got bucket reference');
    
    // In SDK 4.x we don't need explicit wait for bucket
    console.log('Skipping explicit bucket connect wait');

    const collection = bucket.defaultCollection();
    console.log('Got default collection');
    
    // Test simple op
    const testKey = 'test-key-' + Date.now();
    await collection.upsert(testKey, { test: true });
    console.log('Upsert successful');
    
    const result = await collection.get(testKey);
    console.log('Get successful:', result.content);
    
    await collection.remove(testKey);
    console.log('Remove successful');
    
    await cluster.close();
    console.log('Connection closed successfully');
    
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

main();
