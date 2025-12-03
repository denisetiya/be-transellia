import { PrismaClient } from '../generated/prisma';

// Test script to diagnose database connection issues
async function testDatabaseConnection() {
  console.log('=== DATABASE CONNECTION DIAGNOSTIC TEST ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Node.js version:', process.version);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel environment:', process.env.VERCEL ? 'Yes' : 'No');
  console.log('Vercel region:', process.env.VERCEL_REGION || 'Unknown');
  
  // Test 1: Check if DATABASE_URL is properly configured
  console.log('\n--- Test 1: Environment Variables ---');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined');
    return;
  }
  
  // Log URL without exposing credentials
  const urlObj = new URL(databaseUrl);
  const maskedUrl = `${urlObj.protocol}//${urlObj.username ? '***:***@' : ''}${urlObj.host}${urlObj.pathname}`;
  console.log('✅ DATABASE_URL is configured:', maskedUrl);
  console.log('Host:', urlObj.host);
  console.log('Port:', urlObj.port || '5432 (default)');
  console.log('Database:', urlObj.pathname.substring(1));
  
  // Test 2: Test basic TCP connection to the database host
  console.log('\n--- Test 2: TCP Connection Test ---');
  try {
    const net = require('net');
    const host = urlObj.hostname;
    const port = parseInt(urlObj.port) || 5432;
    
    console.log(`Testing TCP connection to ${host}:${port}...`);
    
    const socket = new net.Socket();
    socket.setTimeout(5000); // 5 second timeout
    
    socket.on('connect', () => {
      console.log('✅ TCP connection successful');
      socket.destroy();
    });
    
    socket.on('timeout', () => {
      console.error('❌ TCP connection timeout');
      socket.destroy();
    });
    
    socket.on('error', (err: any) => {
      console.error('❌ TCP connection failed:', err.message);
      if (err.code === 'ENOTFOUND') {
        console.error('   DNS resolution failed - hostname might be incorrect');
      } else if (err.code === 'ECONNREFUSED') {
        console.error('   Connection refused - database might be down or firewall blocking');
      } else if (err.code === 'ETIMEDOUT') {
        console.error('   Connection timed out - network issue or firewall blocking');
      }
    });
    
    socket.connect(port, host);
    
    // Wait for connection test
    await new Promise(resolve => setTimeout(resolve, 6000));
    
  } catch (error) {
    console.error('❌ TCP connection test failed:', error);
  }
  
  // Test 3: Test Prisma client initialization
  console.log('\n--- Test 3: Prisma Client Initialization ---');
  let prisma: PrismaClient;
  
  try {
    console.log('Initializing Prisma client...');
    prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    console.log('✅ Prisma client initialized successfully');
  } catch (error) {
    console.error('❌ Prisma client initialization failed:', error);
    return;
  }
  
  // Test 4: Test basic database query
  console.log('\n--- Test 4: Basic Database Query ---');
  try {
    console.log('Testing basic connection with $queryRaw...');
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT version()`;
    const endTime = Date.now();
    
    console.log('✅ Basic query successful in', endTime - startTime, 'ms');
    console.log('Database version:', result);
  } catch (error: any) {
    console.error('❌ Basic query failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error type:', error.constructor.name);
    
    if (error.message.includes('connection') || error.message.includes('timeout')) {
      console.error('   This appears to be a connection issue');
    }
    if (error.message.includes('authentication') || error.message.includes('password')) {
      console.error('   This appears to be an authentication issue');
    }
  }
  
  // Test 5: Test user table query
  console.log('\n--- Test 5: User Table Query ---');
  try {
    console.log('Testing user table query...');
    const startTime = Date.now();
    const userCount = await prisma.user.count();
    const endTime = Date.now();
    
    console.log('✅ User count query successful in', endTime - startTime, 'ms');
    console.log('Total users:', userCount);
  } catch (error: any) {
    console.error('❌ User count query failed:', error.message);
  }
  
  // Test 6: Test the exact login query
  console.log('\n--- Test 6: Login Query Test ---');
  try {
    console.log('Testing the exact login query used in auth...');
    const startTime = Date.now();
    const testEmail = 'admin@arunika.com';
    const loginQuery = await prisma.user.findUnique({
      where: {
        email: testEmail
      },
      include: {
        userDetails: true
      }
    });
    const endTime = Date.now();
    
    console.log('✅ Login query successful in', endTime - startTime, 'ms');
    console.log('User found:', !!loginQuery);
    if (loginQuery) {
      console.log('User ID:', loginQuery.id);
      console.log('User email:', loginQuery.email);
      console.log('User role:', loginQuery.role);
      console.log('User details:', !!loginQuery.userDetails);
    }
  } catch (error: any) {
    console.error('❌ Login query failed:', error.message);
  }
  
  // Cleanup
  console.log('\n--- Cleanup ---');
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma client disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect Prisma client:', error);
  }
  
  console.log('\n=== DIAGNOSTIC TEST COMPLETED ===');
}

// Run the test
testDatabaseConnection().catch(console.error);