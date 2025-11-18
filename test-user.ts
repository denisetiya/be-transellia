import { PrismaClient } from './src/generated/prisma';
import Hash from './src/lib/lib.hash';
import env from './src/config/env.config';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }

    // Check if subscription exists
    const subscription = await prisma.subscriptionList.findFirst();
    
    if (!subscription) {
      console.log('No subscription found. Creating a default subscription...');
      const newSubscription = await prisma.subscriptionList.create({
        data: {
          name: 'Basic Plan',
          price: 0,
          currency: 'USD',
          description: 'Basic subscription plan',
          features: ['Basic features'],
        }
      });
      console.log('Created subscription:', newSubscription);
    }

    // Create test user
    const salt = Hash.hash('admin@transellia.com', env.SALT).substring(0, 16);
    const hashedPassword = Hash.hash('HuraTransellia-25', salt);
    
    const testSubscription = await prisma.subscriptionList.findFirst();
    
    const newUser = await prisma.user.create({
      data: {
        email: 'admin@transellia.com',
        password: hashedPassword,
        role: 'ADMIN',
        isEmployee: false,
        UserDetails: {
          create: {
            name: 'Admin User'
          }
        },
        subscription: testSubscription ? {
          connect: {
            id: testSubscription.id
          }
        } : undefined
      },
      include: {
        UserDetails: true,
        subscription: true
      }
    });

    console.log('Created test user:', newUser);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();