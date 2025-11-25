import { db } from '../../config/drizzle.config';
import { eq, count } from 'drizzle-orm';
import { subscriptionLists } from '../../db/schema';
import logger from "../../lib/lib.logger";
import { iCreateSubscription, iUpdateSubscription, iSubscriptionId } from "./subscription.validation";
import SubscriptionErrorHandler from "./subscription.error";
import { SubscriptionResult, SubscriptionsResult, UsersBySubscriptionResult, SubscriptionPaymentResult } from "./subscription.type";
import PaymentService from '../payment/payment.service';
import UsersService from '../users/users.service';
import PaymentHistoryService from '../payment-history/payment-history.service';
import { generateId } from '../../lib/lib.id.generator';

export default class SubscriptionService {
    
    static async getAllSubscriptions(page: number = 1, limit: number = 10): Promise<SubscriptionsResult> {
        try {
            logger.info(`Attempting to fetch subscriptions from database - Page: ${page}, Limit: ${limit}`);
            
            // Calculate offset value for pagination
            const offset = (page - 1) * limit;
            
            // Fetch subscriptions with pagination
            const [subscriptionsData, total] = await Promise.all([
                db.select().from(subscriptionLists)
                    .orderBy(subscriptionLists.createdAt)
                    .limit(limit)
                    .offset(offset),
                
                db.select({ count: count() }).from(subscriptionLists).then(result => result[0]?.count || 0)
            ]);
            
            // Calculate total pages
            const totalPages = Math.ceil(total / limit);
            
            logger.info(`Successfully fetched ${subscriptionsData.length} subscriptions (Page: ${page}, Limit: ${limit}, Total: ${total})`);
            
            return {
                data: {
                    subscriptions: subscriptionsData.map(sub => ({
                        id: sub.id,
                        name: sub.name,
                        price: Number(sub.price),
                        currency: sub.currency,
                        description: sub.description,
                        duration: {
                            value: sub.durationValue,
                            unit: sub.durationUnit
                        },
                        features: sub.features,
                        status: sub.status,
                        subscribersCount: sub.subscribersCount,
                        totalRevenue: Number(sub.totalRevenue),
                        createdAt: sub.createdAt,
                        updatedAt: sub.updatedAt
                    })),
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: "Berhasil mendapatkan daftar subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, 'fetch all subscriptions');
        }
    }
    
    static async getSubscriptionById(data: iSubscriptionId): Promise<SubscriptionResult> {
        try {
            logger.info(`Attempting to fetch subscription from database - ID: ${data.id}`);
            
            const subscriptionResult = await db.select().from(subscriptionLists)
                .where(eq(subscriptionLists.id, data.id))
                .limit(1);
            
            if (!subscriptionResult.length) {
                logger.warn(`Subscription not found - ID: ${data.id}`);
                return SubscriptionErrorHandler.errors.notFound(data.id);
            }
            
            const subscription = subscriptionResult[0];
            if (!subscription) {
                logger.error(`Unexpected error: Subscription data is null after successful query - ID: ${data.id}`);
                return SubscriptionErrorHandler.handleDatabaseError(new Error("Subscription data is null"), 'fetch subscription by ID');
            }
            logger.info(`Successfully fetched subscription - ID: ${subscription.id}`);
            
            return {
                data: {
                    id: subscription.id,
                    name: subscription.name,
                    price: Number(subscription.price),
                    currency: subscription.currency,
                    description: subscription.description,
                    duration: {
                        value: subscription.durationValue,
                        unit: subscription.durationUnit
                    },
                    features: subscription.features,
                    status: subscription.status,
                    subscribersCount: subscription.subscribersCount,
                    totalRevenue: Number(subscription.totalRevenue),
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt
                },
                message: "Berhasil mendapatkan detail subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `fetch subscription by ID: ${data.id}`);
        }
    }
    
    static async createSubscription(data: iCreateSubscription): Promise<SubscriptionResult> {
        try {
            logger.info("Attempting to create subscription in database");
            
            const [subscription] = await db.insert(subscriptionLists).values({
                id: generateId(),
                name: data.name,
                price: data.price.toString(),
                currency: data.currency || 'IDR',
                description: data.description,
                durationValue: data.duration?.value || 1,
                durationUnit: data.duration?.unit || 'months',
                features: data.features,
                status: (data.status || 'active') as "active" | "inactive" | "pending"
            }).returning();
            
            if (!subscription) {
                logger.error(`Failed to create subscription`);
                return SubscriptionErrorHandler.handleDatabaseError(new Error("Failed to create subscription"), 'create subscription');
            }
            
            logger.info(`Successfully created subscription - ID: ${subscription.id}`);
            
            return {
                data: {
                    id: subscription.id,
                    name: subscription.name,
                    price: Number(subscription.price),
                    currency: subscription.currency,
                    description: subscription.description,
                    duration: {
                        value: subscription.durationValue,
                        unit: subscription.durationUnit
                    },
                    features: subscription.features,
                    status: subscription.status,
                    subscribersCount: subscription.subscribersCount,
                    totalRevenue: Number(subscription.totalRevenue),
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt
                },
                message: "Berhasil membuat subscription baru",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, 'create subscription');
        }
    }
    
    static async updateSubscription(id: string, data: iUpdateSubscription): Promise<SubscriptionResult> {
        try {
            logger.info(`Attempting to update subscription in database - ID: ${id}`);
            
            // Check if subscription exists
            const existingSubscription = await db.select().from(subscriptionLists)
                .where(eq(subscriptionLists.id, id))
                .limit(1);
            
            if (!existingSubscription.length) {
                logger.warn(`Subscription not found for update - ID: ${id}`);
                return SubscriptionErrorHandler.errors.notFound(id);
            }
            
            const updateData: Partial<{
                name: string;
                price: string;
                currency: string;
                description: string | null;
                durationValue: number;
                durationUnit: "days" | "weeks" | "months" | "years";
                features: string[];
                status: "active" | "inactive" | "pending";
            }> = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.price !== undefined) updateData.price = data.price.toString();
            if (data.currency !== undefined) updateData.currency = data.currency;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.duration?.value !== undefined) updateData.durationValue = data.duration.value;
            if (data.duration?.unit !== undefined) updateData.durationUnit = data.duration.unit;
            if (data.features !== undefined) updateData.features = data.features;
            // Convert "draft" status to "pending" for database compatibility
            if (data.status !== undefined) {
                if (data.status === "draft") {
                    updateData.status = "pending";
                } else {
                    updateData.status = data.status as "active" | "inactive" | "pending";
                }
            }
            
            const subscription = await db.update(subscriptionLists)
                .set(updateData)
                .where(eq(subscriptionLists.id, id))
                .returning();
            
            if (!subscription.length) {
                logger.error(`Failed to update subscription - ID: ${id}`);
                return SubscriptionErrorHandler.handleDatabaseError(new Error("Failed to update subscription"), 'update subscription');
            }
            
            const updatedSubscription = subscription[0];
            if (!updatedSubscription) {
                logger.error(`Failed to retrieve updated subscription - ID: ${id}`);
                return SubscriptionErrorHandler.handleDatabaseError(new Error("Failed to retrieve updated subscription"), 'update subscription');
            }
            
            logger.info(`Successfully updated subscription - ID: ${updatedSubscription.id}`);
            if (!updatedSubscription) {
                logger.error(`Failed to retrieve updated subscription - ID: ${id}`);
                return SubscriptionErrorHandler.handleDatabaseError(new Error("Failed to retrieve updated subscription"), 'update subscription');
            }
            
            return {
                data: {
                    id: updatedSubscription.id,
                    name: updatedSubscription.name,
                    price: Number(updatedSubscription.price),
                    currency: updatedSubscription.currency,
                    description: updatedSubscription.description,
                    duration: {
                        value: updatedSubscription.durationValue,
                        unit: updatedSubscription.durationUnit
                    },
                    features: updatedSubscription.features,
                    status: updatedSubscription.status,
                    subscribersCount: updatedSubscription.subscribersCount,
                    totalRevenue: Number(updatedSubscription.totalRevenue),
                    createdAt: updatedSubscription.createdAt,
                    updatedAt: updatedSubscription.updatedAt
                },
                message: "Berhasil memperbarui subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `update subscription ID: ${id}`);
        }
    }
    
    static async deleteSubscription(data: iSubscriptionId): Promise<SubscriptionResult> {
        try {
            logger.info(`Attempting to delete subscription from database - ID: ${data.id}`);
            
            // Check if subscription exists
            const existingSubscription = await db.select().from(subscriptionLists)
                .where(eq(subscriptionLists.id, data.id))
                .limit(1);
            
            if (!existingSubscription.length) {
                logger.warn(`Subscription not found for deletion - ID: ${data.id}`);
                return SubscriptionErrorHandler.errors.notFound(data.id);
            }
            
            await db.delete(subscriptionLists).where(eq(subscriptionLists.id, data.id));
            
            logger.info(`Successfully deleted subscription - ID: ${data.id}`);
            
            const deletedSubscription = existingSubscription[0];
            if (!deletedSubscription) {
                logger.error(`Failed to retrieve deleted subscription - ID: ${data.id}`);
                return SubscriptionErrorHandler.handleDatabaseError(new Error("Failed to retrieve deleted subscription"), 'delete subscription');
            }
            
            return {
                data: {
                    id: deletedSubscription.id,
                    name: deletedSubscription.name,
                    price: Number(deletedSubscription.price),
                    currency: deletedSubscription.currency,
                    description: deletedSubscription.description,
                    duration: {
                        value: deletedSubscription.durationValue,
                        unit: deletedSubscription.durationUnit
                    },
                    features: deletedSubscription.features,
                    status: deletedSubscription.status,
                    subscribersCount: deletedSubscription.subscribersCount,
                    totalRevenue: Number(deletedSubscription.totalRevenue),
                    createdAt: deletedSubscription.createdAt,
                    updatedAt: deletedSubscription.updatedAt
                },
                message: "Berhasil menghapus subscription",
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `delete subscription ID: ${data.id}`);
        }
    }
    
    static async getUsersBySubscriptionId(subscriptionId: string): Promise<UsersBySubscriptionResult> {
        try {
            logger.info(`Attempting to fetch users with subscription ID: ${subscriptionId}`);
            
            // Import users table here to avoid circular dependency
            const { users, userDetails } = await import('../../db/schema');
            
            // Check if subscription exists
            const subscription = await db.select().from(subscriptionLists)
                .where(eq(subscriptionLists.id, subscriptionId))
                .limit(1);
            
            if (!subscription.length) {
                logger.warn(`Subscription not found - ID: ${subscriptionId}`);
                return SubscriptionErrorHandler.errors.notFound(subscriptionId);
            }
            
            // Fetch users with this subscription
            const usersData = await db.select({
                id: users.id,
                email: users.email,
                role: users.role,
                subscriptionId: users.subscriptionId,
                isEmployee: users.isEmployee,
                userDetails: {
                    id: userDetails.id,
                    userId: userDetails.userId,
                    name: userDetails.name,
                    phoneNumber: userDetails.phoneNumber,
                    imageProfile: userDetails.imageProfile,
                    createdAt: userDetails.createdAt,
                    updatedAt: userDetails.updatedAt
                }
            })
                .from(users)
                .leftJoin(userDetails, eq(users.id, userDetails.userId))
                .where(eq(users.subscriptionId, subscriptionId));
            
            logger.info(`Successfully fetched ${usersData.length} users with subscription ID: ${subscriptionId}`);
            
            return {
                data: usersData.map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId,
                    UserDetails: user.userDetails,
                    isEmployee: user.isEmployee
                })),
                message: `Berhasil mendapatkan ${usersData.length} pengguna dengan subscription ID: ${subscriptionId}`,
                success: true
            };
            
        } catch (error) {
            return SubscriptionErrorHandler.handleDatabaseError(error, `fetch users by subscription ID: ${subscriptionId}`);
        }
    }
    
    /**
     * Process subscription payment and update user subscription on success
     * @param userId - The ID of the user making the payment
     * @param subscriptionId - The ID of the subscription being purchased
     * @returns PaymentResult with success or error information
     */
    static async processSubscriptionPayment(
        userId: string,
        subscriptionId: string,
        paymentMethod: 'va' | 'qr' | 'wallet',
        bank?: string,
        walletProvider?: string
    ): Promise<SubscriptionPaymentResult> {
        try {
            logger.info(`Processing subscription payment - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
            
            // Import users and userDetails tables here to avoid circular dependency
            const { users, userDetails } = await import('../../db/schema');
            
            // Check if subscription exists
            const subscriptionResult = await db.select().from(subscriptionLists)
                .where(eq(subscriptionLists.id, subscriptionId))
                .limit(1);
            
            if (!subscriptionResult.length) {
                logger.warn(`Subscription not found - ID: ${subscriptionId}`);
                return {
                    data: null,
                    message: `Subscription with ID ${subscriptionId} not found`,
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            const subscription = subscriptionResult[0];
            if (!subscription) {
                logger.error(`Unexpected error: Subscription data is null after successful query - ID: ${subscriptionId}`);
                return {
                    data: null,
                    message: `Unexpected error with subscription ID ${subscriptionId}`,
                    success: false,
                    errorType: 'INTERNAL_ERROR'
                };
            }
            
            // Get user details
            const userResult = await db.select({
                id: users.id,
                email: users.email,
                name: userDetails.name,
                phoneNumber: userDetails.phoneNumber
            })
                .from(users)
                .leftJoin(userDetails, eq(users.id, userDetails.userId))
                .where(eq(users.id, userId))
                .limit(1);
            
            if (!userResult.length) {
                logger.warn(`User not found - ID: ${userId}`);
                return {
                    data: null,
                    message: `User with ID ${userId} not found`,
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            const user = userResult[0];
            if (!user) {
                logger.error(`Unexpected error: User data is null after successful query - ID: ${userId}`);
                return {
                    data: null,
                    message: `Unexpected error with user ID ${userId}`,
                    success: false,
                    errorType: 'INTERNAL_ERROR'
                };
            }
            
            // Create payment request
            const paymentRequest = {
                orderId: `SUB_${subscriptionId}_${userId}_${Date.now()}`,
                amount: Number(subscription.price), // Convert decimal to number
                currency: 'IDR',
                customer: {
                    id: userId,
                    email: user.email,
                    firstName: user.name || '',
                    lastName: '',
                    phone: user.phoneNumber || ''
                },
                paymentMethod,
                bank,
                walletProvider
            };
            
            // Process payment using PaymentService
            const paymentResult = await PaymentService.createPayment(paymentRequest);
            
            // Create payment history record
            const paymentHistoryData = {
                userId: userId,
                subscriptionId: subscriptionId,
                orderId: paymentRequest.orderId,
                paymentId: paymentResult.data?.paymentId || null,
                amount: Number(subscription.price), // Convert decimal to number
                currency: paymentRequest.currency,
                paymentMethod: paymentRequest.paymentMethod,
                status: paymentResult.success ? 'pending' : 'failed',
                transactionTime: new Date(),
                expiryTime: paymentResult.data?.expiryTime ? new Date(paymentResult.data.expiryTime) : null,
                vaNumber: paymentResult.data?.vaNumber || null,
                bank: paymentRequest.bank || null,
                qrCode: paymentResult.data?.qrCode || null,
                redirectUrl: paymentResult.data?.redirectUrl || null
            };
            
            const paymentHistoryResult = await PaymentHistoryService.createPaymentHistory(paymentHistoryData);
            
            if (!paymentHistoryResult.success) {
                logger.error(`Failed to create payment history record: ${paymentHistoryResult.message}`);
                // Continue with payment processing even if history creation fails
            }
            
            if (paymentResult.success) {
                logger.info(`Payment processed successfully for order ${paymentRequest.orderId}`);
                
                // Update user's subscription
                const userUpdated = await UsersService.updateUserSubscription(userId, subscriptionId);
                
                if (userUpdated) {
                    logger.info(`Successfully updated user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
                    
                    // Update payment history status to success
                    await PaymentHistoryService.updatePaymentHistoryStatus(paymentRequest.orderId, 'success', paymentResult.data?.paymentId || undefined);
                    
                    return {
                        data: {
                            orderId: paymentResult.data?.orderId,
                            paymentId: paymentResult.data?.paymentId,
                            subscriptionId: subscription.id,
                            subscriptionName: subscription.name,
                            amount: Number(subscription.price), // Convert decimal to number
                            redirectUrl: paymentResult.data?.redirectUrl,
                            qrCode: paymentResult.data?.qrCode,
                            vaNumber: paymentResult.data?.vaNumber,
                            expiryTime: paymentResult.data?.expiryTime
                        },
                        message: "Subscription payment successful and subscription updated",
                        success: true
                    };
                } else {
                    logger.error(`Failed to update user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
                    return {
                        data: null,
                        message: 'Failed to update user subscription',
                        success: false,
                        errorType: 'INTERNAL_ERROR'
                    };
                }
            } else {
                // Payment failed
                logger.error(`Payment failed for order ${paymentRequest.orderId}: ${paymentResult.message}`);
                
                // Update payment history status to failed
                await PaymentHistoryService.updatePaymentHistoryStatus(paymentRequest.orderId, 'failed');
                
                return paymentResult;
            }
            
        } catch (error) {
            return {
                data: null,
                message: error instanceof Error ? error.message : 'Failed to process subscription payment',
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
}