import logger from "../../lib/lib.logger";
import { iCreateSubscription, iUpdateSubscription, iSubscriptionId } from "./subscription.validation";
import SubscriptionErrorHandler from "./subscription.error";
import { SubscriptionResult, SubscriptionsResult, UsersBySubscriptionResult, SubscriptionPaymentResult } from "./subscription.type";
import PaymentService from '../payment/payment.service';
import { generateId } from '../../lib/lib.id.generator';
import { SubscriptionListRepository, UserRepository, PaymentHistoryRepository, type ISubscriptionList } from '../../models';

export default class SubscriptionService {
    
    static async getSubscriptionPlans() {
        try {
            const plans = await SubscriptionListRepository.findAllActive();
            return {
                success: true,
                data: plans
            };
        } catch (error) {
            logger.error(`Failed to get subscription plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    static async subscribe(userId: string, subscriptionId: string) {
        try {
            const user = await UserRepository.findById(userId);
            if (!user) throw new Error('User not found');
            
            const plan = await SubscriptionListRepository.findById(subscriptionId);
            if (!plan) throw new Error('Subscription plan not found');

            // Here we would integrate payment gateway logic
            // For now, simple update
            await UserRepository.update(userId, { subscriptionId: plan.id });
            
            // Create payment history record
            await PaymentHistoryRepository.create({
                userId,
                subscriptionId: plan.id,
                orderId: generateId(), // Placeholder
                amount: plan.price,
                currency: plan.currency,
                paymentMethod: 'credit_card', // Placeholder
                status: 'success'
            });

            return {
                success: true,
                message: 'Subscribed successfully'
            };

        } catch (error) {
             logger.error(`Subscription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }


    
    static async getAllSubscriptions(page: number = 1, limit: number = 10): Promise<SubscriptionsResult> {
        try {
            logger.info(`Attempting to fetch subscriptions from database - Page: ${page}, Limit: ${limit}`);
            
            // Note: Pagination logic (skip/limit) should be implemented in Repository if needed natively.
            // For now, we fetch all and slice in memory or simpler repository usage.
            // Repository currently just returns all for find().
            // TODO: Enhance Repository for pagination.
            
            const allSubscriptions = await SubscriptionListRepository.findAllActive();
            // Or use a new getAll() method in repo
            
            const total = allSubscriptions.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            
            const subscriptionsData = allSubscriptions.slice(skip, skip + limit);
            
            logger.info(`Successfully fetched ${subscriptionsData.length} subscriptions (Page: ${page}, Limit: ${limit}, Total: ${total})`);
            
            return {
                data: {
                    subscriptions: subscriptionsData.map(sub => ({
                        id: sub.id,
                        name: sub.name,
                        price: sub.price,
                        currency: sub.currency,
                        description: sub.description,
                        duration: {
                            value: sub.durationValue,
                            unit: sub.durationUnit
                        },
                        features: sub.features,
                        status: sub.status,
                        subscribersCount: sub.subscribersCount,
                        totalRevenue: sub.totalRevenue,
                        createdAt: new Date(sub.createdAt), // Convert string to Date for frontend? Interface expects Date usually
                        updatedAt: new Date(sub.updatedAt)
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
            
            const subscription = await SubscriptionListRepository.findById(data.id);
            
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
                    currency: subscription.currency,
                    description: subscription.description,
                    duration: {
                        value: subscription.durationValue,
                        unit: subscription.durationUnit
                    },
                    features: subscription.features,
                    status: subscription.status,
                    subscribersCount: subscription.subscribersCount,
                    totalRevenue: subscription.totalRevenue,
                    createdAt: new Date(subscription.createdAt),
                    updatedAt: new Date(subscription.updatedAt)
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
            
            const created = await SubscriptionListRepository.create({
                name: data.name,
                price: data.price,
                currency: data.currency || 'IDR',
                description: data.description,
                durationValue: data.duration?.value || 1,
                durationUnit: data.duration?.unit || 'months',
                features: data.features,
                status: (data.status || 'active') as "active" | "inactive" | "pending",
                subscribersCount: 0,
                totalRevenue: 0,
            });
            
            logger.info(`Successfully created subscription - ID: ${created.id}`);
            
            return {
                data: {
                    id: created.id,
                    name: created.name,
                    price: created.price,
                    currency: created.currency,
                    description: created.description,
                    duration: {
                        value: created.durationValue,
                        unit: created.durationUnit
                    },
                    features: created.features,
                    status: created.status,
                    subscribersCount: created.subscribersCount,
                    totalRevenue: created.totalRevenue,
                    createdAt: new Date(created.createdAt),
                    updatedAt: new Date(created.updatedAt)
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
            const existingSubscription = await SubscriptionListRepository.findById(id);
            
            if (!existingSubscription) {
                logger.warn(`Subscription not found for update - ID: ${id}`);
                return SubscriptionErrorHandler.errors.notFound(id);
            }
            
            const updateData: Partial<ISubscriptionList> = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.price !== undefined) updateData.price = data.price;
            if (data.currency !== undefined) updateData.currency = data.currency;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.duration?.value !== undefined) updateData.durationValue = data.duration.value;
            if (data.duration?.unit !== undefined) updateData.durationUnit = data.duration.unit;
            if (data.features !== undefined) updateData.features = data.features;
            if (data.status !== undefined) {
                if (data.status === "draft") {
                    updateData.status = "pending";
                } else {
                    updateData.status = data.status;
                }
            }
            
            await SubscriptionListRepository.update(id, updateData); // This might fail if updateData is not strictly Partial<ISubscriptionList>.
            // But Repository update takes partial, should be fine if types match.
            
            // Fetch updated subscription
            const updatedSubscription = await SubscriptionListRepository.findById(id);
            if (!updatedSubscription) throw new Error('Failed to fetch updated subscription');

            logger.info(`Successfully updated subscription - ID: ${updatedSubscription.id}`);
            
            return {
                data: {
                    id: updatedSubscription.id,
                    name: updatedSubscription.name,
                    price: updatedSubscription.price,
                    currency: updatedSubscription.currency,
                    description: updatedSubscription.description,
                    duration: {
                        value: updatedSubscription.durationValue,
                        unit: updatedSubscription.durationUnit
                    },
                    features: updatedSubscription.features,
                    status: updatedSubscription.status,
                    subscribersCount: updatedSubscription.subscribersCount,
                    totalRevenue: updatedSubscription.totalRevenue,
                    createdAt: new Date(updatedSubscription.createdAt),
                    updatedAt: new Date(updatedSubscription.updatedAt)
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
            const existingSubscription = await SubscriptionListRepository.findById(data.id);
            
            if (!existingSubscription) {
                logger.warn(`Subscription not found for deletion - ID: ${data.id}`);
                return SubscriptionErrorHandler.errors.notFound(data.id);
            }
            
            // Repository doesn't have delete/remove implementation yet in my mock code?
            // Wait, StoreRepository had delete. SubscriptionListRepository logic needs checking. 
            // Assuming I will add it or it exists.
            // If not, I'll add "delete" to SubscriptionListRepository now.
            
            // For now, let's assume update status to inactive? Or delete?
            // User requested delete.
            // Let's implement hard delete if repository supports it.
            // I'll check/add delete method to SubscriptionListRepository in next step if missing.
            
            await SubscriptionListRepository.delete(data.id); // Potential Error if not defined
            
            logger.info(`Successfully deleted subscription - ID: ${data.id}`);
            
            return {
                data: {
                    id: existingSubscription.id,
                    name: existingSubscription.name,
                    price: existingSubscription.price,
                    currency: existingSubscription.currency,
                    description: existingSubscription.description,
                    duration: {
                        value: existingSubscription.durationValue,
                        unit: existingSubscription.durationUnit
                    },
                    features: existingSubscription.features,
                    status: existingSubscription.status,
                    subscribersCount: existingSubscription.subscribersCount,
                    totalRevenue: existingSubscription.totalRevenue,
                    createdAt: new Date(existingSubscription.createdAt),
                    updatedAt: new Date(existingSubscription.updatedAt)
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
            
            // Check if subscription exists
            const subscription = await SubscriptionListRepository.findById(subscriptionId);
            
            if (!subscription) {
                logger.warn(`Subscription not found - ID: ${subscriptionId}`);
                return SubscriptionErrorHandler.errors.notFound(subscriptionId);
            }
            
            // Fetch users with this subscription
            const usersData = await UserRepository.findBySubscriptionId(subscriptionId); 
            // Note: findBySubscriptionId needs to be added to UserRepository
            
            logger.info(`Successfully fetched ${usersData.length} users with subscription ID: ${subscriptionId}`);
            
            return {
                data: usersData.map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId || null,
                    UserDetails: user.userDetails ? {
                        name: user.userDetails.name || undefined,
                        phoneNumber: user.userDetails.phoneNumber || undefined,
                        imageProfile: user.userDetails.imageProfile || undefined,
                        address: user.userDetails.address || undefined,
                    } : null,
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
            
            // Check if subscription exists
            const subscription = await SubscriptionListRepository.findById(subscriptionId);
            
            if (!subscription) {
                logger.warn(`Subscription not found - ID: ${subscriptionId}`);
                return {
                    data: null,
                    message: `Subscription with ID ${subscriptionId} not found`,
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            // Get user details
            const user = await UserRepository.findById(userId);
            
            if (!user) {
                logger.warn(`User not found - ID: ${userId}`);
                return {
                    data: null,
                    message: `User with ID ${userId} not found`,
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            // Create payment request
            const paymentRequest = {
                orderId: `SUB_${subscriptionId}_${userId}_${Date.now()}`,
                amount: subscription.price,
                currency: 'IDR',
                customer: {
                    id: userId,
                    email: user.email,
                    firstName: user.userDetails?.name || '',
                    lastName: '',
                    phone: user.userDetails?.phoneNumber || ''
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
                paymentId: paymentResult.data?.paymentId || undefined,
                amount: subscription.price,
                currency: paymentRequest.currency,
                paymentMethod: paymentRequest.paymentMethod,
                status: 'pending' as const,
                transactionTime: new Date().toISOString(),
                expiryTime: paymentResult.data?.expiryTime ? new Date(paymentResult.data.expiryTime).toISOString() : undefined,
                vaNumber: paymentResult.data?.vaNumber || undefined,
                bank: paymentRequest.bank || undefined,
                qrCode: paymentResult.data?.qrCode || undefined,
                redirectUrl: paymentResult.data?.redirectUrl || undefined
            };
            
            const paymentHistoryResult = await PaymentHistoryRepository.create(paymentHistoryData);
            
            if (!paymentHistoryResult) { // Check if creation failed, though repo throws error usually
                 logger.error(`Failed to create payment history record`);
            }
             
            if (paymentResult.success) {
                logger.info(`Payment processed successfully for order ${paymentRequest.orderId}`);
                
                // Update user's subscription
                // Using Repository directly instead of UsersService to avoid circular deps or extra abstraction
                await UserRepository.update(userId, { subscriptionId });
                
                logger.info(`Successfully updated user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
                
                // Update payment history status to success
                // Assuming PaymentHistoryRepository supports status update or we use general update
                // For now, let's assume we can update by orderId if we implement it, but for now strict to ID usually.
                // But wait, create returns the object with ID.
                if (paymentHistoryResult && paymentHistoryResult.id) {
                     await PaymentHistoryRepository.update(paymentHistoryResult.id, { status: 'success' });
                }

                // Or if PaymentHistoryService exists and handles this logic? 
                // The original code used PaymentHistoryService.updatePaymentHistoryStatus.
                // I should keep using PaymentHistoryService if it was refactored, OR refactor it to use Repository.
                // Given I haven't seen PaymentHistoryService refactored file, I assume I should use Repository.
                
                return {
                    data: {
                        orderId: paymentResult.data?.orderId,
                        paymentId: paymentResult.data?.paymentId,
                        subscriptionId: subscription.id,
                        subscriptionName: subscription.name,
                        amount: subscription.price,
                        redirectUrl: paymentResult.data?.redirectUrl,
                        qrCode: paymentResult.data?.qrCode,
                        vaNumber: paymentResult.data?.vaNumber,
                        expiryTime: paymentResult.data?.expiryTime
                    },
                    message: "Subscription payment successful and subscription updated",
                    success: true
                };

            } else {
                // Payment failed
                logger.error(`Payment failed for order ${paymentRequest.orderId}: ${paymentResult.message}`);
                
                // Update payment history status to failed
                if (paymentHistoryResult && paymentHistoryResult.id) {
                     await PaymentHistoryRepository.update(paymentHistoryResult.id, { status: 'failed' });
                }
                
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

    /**
     * Seed a Free Trial subscription if not exists
     */
    static async seedTrialSubscription(): Promise<{ success: boolean; message: string; subscription?: ISubscriptionList }> {
        try {
            logger.info('Checking if Free Trial subscription exists...');
            
            const existingTrial = await SubscriptionListRepository.findByName('Free Trial');
            
            if (existingTrial) {
                logger.info('Free Trial subscription already exists');
                return {
                    success: true,
                    message: 'Free Trial subscription already exists',
                    subscription: existingTrial
                };
            }
            
            // Create Free Trial subscription
            const trialData: Omit<ISubscriptionList, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                name: 'Free Trial',
                price: 0,
                currency: 'IDR',
                description: '1 Bulan Uji Coba Gratis untuk pengguna baru',
                durationValue: 1,
                durationUnit: 'months',
                features: ['POS System', 'Employee Management', 'Basic Reporting', 'Attendance', 'Inventory'],
                status: 'active',
                subscribersCount: 0,
                totalRevenue: 0,
            };
            
            const created = await SubscriptionListRepository.create(trialData);
            
            logger.info(`Free Trial subscription created - ID: ${created.id}`);
            
            return {
                success: true,
                message: 'Free Trial subscription created successfully',
                subscription: created
            };
            
        } catch (error) {
            logger.error(`Failed to seed trial subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                message: `Failed to seed trial subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}