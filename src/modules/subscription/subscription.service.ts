import prisma from '../../config/prisma.config';
import logger from "../../lib/lib.logger";
import { iCreateSubscription, iUpdateSubscription, iSubscriptionId } from "./subscription.validation";
import SubscriptionErrorHandler from "./subscription.error";
import { SubscriptionResult, SubscriptionsResult, UsersBySubscriptionResult } from "./subscription.type";

export default class SubscriptionService {
    
    static async getAllSubscriptions(page: number = 1, limit: number = 10): Promise<SubscriptionsResult> {
        try {
            logger.info(`Attempting to fetch subscriptions from database - Page: ${page}, Limit: ${limit}`);
            
            // Check database connection
            await prisma.$connect();
            
            // Calculate skip value for pagination
            const skip = (page - 1) * limit;
            
            // Fetch subscriptions with pagination
            const [subscriptions, total] = await Promise.all([
                prisma.subscriptionList.findMany({
                    orderBy: {
                        createdAt: 'asc'
                    },
                    skip,
                    take: limit
                }),
                prisma.subscriptionList.count()
            ]);
            
            // Calculate total pages
            const totalPages = Math.ceil(total / limit);
            
            logger.info(`Successfully fetched ${subscriptions.length} subscriptions (Page: ${page}, Limit: ${limit}, Total: ${total})`);
            
            return {
                data: subscriptions.map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    price: sub.price,
                    description: sub.description,
                    features: sub.features,
                    createdAt: sub.createdAt,
                    updatedAt: sub.updatedAt
                })),
                message: "Berhasil mendapatkan daftar subscription",
                success: true,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, 'fetch all subscriptions');
        } finally {
            await prisma.$disconnect();
        }
    }
    
    static async getSubscriptionById(data: iSubscriptionId): Promise<SubscriptionResult> {
        try {
            logger.info(`Attempting to fetch subscription from database - ID: ${data.id}`);
            
            // Check database connection
            await prisma.$connect();
            
            const subscription = await prisma.subscriptionList.findUnique({
                where: {
                    id: data.id
                }
            });
            
            if (!subscription) {
                logger.warn(`Subscription not found - ID: ${data.id}`);
                return SubscriptionErrorHandler.errors.notFound(data.id);
            }
            
            logger.info(`Successfully fetched subscription - ID: ${subscription.id}`);
            
            return {
                data: {
                    id: subscription.id,
                    name: subscription.name,
                    price: subscription.price,
                    description: subscription.description,
                    features: subscription.features,
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt
                },
                message: "Berhasil mendapatkan detail subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `fetch subscription by ID: ${data.id}`);
        } finally {
            await prisma.$disconnect();
        }
    }
    
    static async createSubscription(data: iCreateSubscription): Promise<SubscriptionResult> {
        try {
            logger.info("Attempting to create subscription in database");
            
            // Check database connection
            await prisma.$connect();
            
            const subscription = await prisma.subscriptionList.create({
                data: {
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    features: data.features
                }
            });
            
            logger.info(`Successfully created subscription - ID: ${subscription.id}`);
            
            return {
                data: {
                    id: subscription.id,
                    name: subscription.name,
                    price: subscription.price,
                    description: subscription.description,
                    features: subscription.features,
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt
                },
                message: "Berhasil membuat subscription baru",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, 'create subscription');
        } finally {
            await prisma.$disconnect();
        }
    }
    
    static async updateSubscription(id: string, data: iUpdateSubscription): Promise<SubscriptionResult> {
        try {
            logger.info(`Attempting to update subscription in database - ID: ${id}`);
            
            // Check database connection
            await prisma.$connect();
            
            // Check if subscription exists
            const existingSubscription = await prisma.subscriptionList.findUnique({
                where: {
                    id: id
                }
            });
            
            if (!existingSubscription) {
                logger.warn(`Subscription not found for update - ID: ${id}`);
                return SubscriptionErrorHandler.errors.notFound(id);
            }
            
            const subscription = await prisma.subscriptionList.update({
                where: {
                    id: id
                },
                data: {
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    features: data.features
                }
            });
            
            logger.info(`Successfully updated subscription - ID: ${subscription.id}`);
            
            return {
                data: {
                    id: subscription.id,
                    name: subscription.name,
                    price: subscription.price,
                    description: subscription.description,
                    features: subscription.features,
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt
                },
                message: "Berhasil memperbarui subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `update subscription ID: ${id}`);
        } finally {
            await prisma.$disconnect();
        }
    }
    
    static async deleteSubscription(data: iSubscriptionId): Promise<SubscriptionResult> {
        try {
            logger.info(`Attempting to delete subscription from database - ID: ${data.id}`);
            
            // Check database connection
            await prisma.$connect();
            
            // Check if subscription exists
            const existingSubscription = await prisma.subscriptionList.findUnique({
                where: {
                    id: data.id
                }
            });
            
            if (!existingSubscription) {
                logger.warn(`Subscription not found for deletion - ID: ${data.id}`);
                return SubscriptionErrorHandler.errors.notFound(data.id);
            }
            
            await prisma.subscriptionList.delete({
                where: {
                    id: data.id
                }
            });
            
            logger.info(`Successfully deleted subscription - ID: ${data.id}`);
            
            return {
                data: {
                    id: existingSubscription.id,
                    name: existingSubscription.name,
                    price: existingSubscription.price,
                    description: existingSubscription.description,
                    features: existingSubscription.features,
                    createdAt: existingSubscription.createdAt,
                    updatedAt: existingSubscription.updatedAt
                },
                message: "Berhasil menghapus subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `delete subscription ID: ${data.id}`);
        } finally {
            await prisma.$disconnect();
        }
    }
    
    static async getUsersBySubscriptionId(subscriptionId: string): Promise<UsersBySubscriptionResult> {
        try {
            logger.info(`Attempting to fetch users with subscription ID: ${subscriptionId}`);
            
            // Check database connection
            await prisma.$connect();
            
            // Check if subscription exists
            const subscription = await prisma.subscriptionList.findUnique({
                where: {
                    id: subscriptionId
                }
            });
            
            if (!subscription) {
                logger.warn(`Subscription not found - ID: ${subscriptionId}`);
                return SubscriptionErrorHandler.errors.notFound(subscriptionId);
            }
            
            // Fetch users with this subscription
            const users = await prisma.user.findMany({
                where: {
                    subscriptionId: subscriptionId
                },
                include: {
                    UserDetails: true
                }
            });
            
            logger.info(`Successfully fetched ${users.length} users with subscription ID: ${subscriptionId}`);
            
            return {
                data: users.map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId,
                    UserDetails: user.UserDetails,
                    isEmployee: user.isEmployee
                })),
                message: `Berhasil mendapatkan ${users.length} pengguna dengan subscription ID: ${subscriptionId}`,
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `fetch users by subscription ID: ${subscriptionId}`);
        } finally {
            await prisma.$disconnect();
        }
    }
}