import type { Request, Response } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import SubscriptionService from './subscription.service';
import {
    createSubscriptionSchema,
    updateSubscriptionSchema,
    subscriptionIdSchema,
    type iCreateSubscription,
    type iUpdateSubscription,
    type iSubscriptionId
} from './subscription.validation';
import { subscriptionPaymentSchema, type SubscriptionPaymentRequest } from './subscription.payment.validation';
import { createValidationErrorResponse } from '../../lib/lib.validation';
import UsersService from '../users/users.service';
import PaymentHistoryService from '../payment-history/payment-history.service';

export default class SubscriptionController {

    static async getAllSubscriptions(req: Request, res: Response) {
        try {
            logger.info('Fetching all subscriptions with pagination');
            
            // Extract pagination parameters from query
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            // Validate pagination parameters
            if (page < 1 || isNaN(page)) {
                return response.badRequest(
                    res,
                    "Parameter 'page' harus berupa angka positif"
                );
            }
            
            if (limit < 1 || limit > 100 || isNaN(limit)) {
                return response.badRequest(
                    res,
                    "Parameter 'limit' harus berupa angka antara 1 dan 100"
                );
            }
            
            const result = await SubscriptionService.getAllSubscriptions(page, limit);
            
            if (result.success) {
                logger.info(`Successfully fetched ${result.data.subscriptions.length} subscriptions (Page: ${page}, Limit: ${limit})`);
                return response.success(
                    res,
                    result.data,
                    result.message
                );
            }
            
            // Handle service errors
            return response.internalServerError(
                res,
                result.message
            );
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in getAllSubscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }

    static async getSubscriptionById(req: Request, res: Response) {
        try {
            logger.info(`Fetching subscription by ID: ${req.params.id}`);
            
            // Check if ID exists
            if (!req.params.id) {
                return response.badRequest(
                    res,
                    "ID subscription wajib diisi"
                );
            }
            
            const data: iSubscriptionId = {
                id: req.params.id
            };
            
            // Validate ID
            const validation = subscriptionIdSchema.safeParse(data);
            if (!validation.success) {
                logger.warn(`Subscription ID validation failed - ID: ${data.id}`);
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const result = await SubscriptionService.getSubscriptionById(data);
            
            if (result.success) {
                logger.info(`Successfully fetched subscription - ID: ${result.data.id}`);
                return response.success(
                    res,
                    {
                        subscription: result.data,
                    },
                    result.message
                );
            }
            
            // Handle service errors
            switch (result.errorType) {
                case 'NOT_FOUND':
                    return response.notFound(
                        res,
                        result.message
                    );
                default:
                    return response.internalServerError(
                        res,
                        result.message
                    );
            }
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in getSubscriptionById: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }

    static async createSubscription(req: Request, res: Response) {
        try {
            logger.info('Creating new subscription');
            
            const data: iCreateSubscription = req.body;
            
            // Validate request body
            const validation = createSubscriptionSchema.safeParse(data);
            if (!validation.success) {
                logger.warn('Subscription creation failed validation');
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const result = await SubscriptionService.createSubscription(validation.data);
            
            if (result.success) {
                logger.info(`Successfully created subscription - ID: ${result.data.id}`);
                return response.created(
                    res,
                    {
                        subscription: result.data,
                    }
                );
            }
            
            // Handle service errors
            return response.internalServerError(
                res,
                result.message
            );
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in createSubscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }

    static async updateSubscription(req: Request, res: Response) {
        try {
            logger.info(`Updating subscription - ID: ${req.params.id}`);
            
            // Check if ID exists
            if (!req.params.id) {
                return response.badRequest(
                    res,
                    "ID subscription wajib diisi"
                );
            }
            
            const data: iUpdateSubscription = req.body;
            
            // Validate ID
            const idValidation = subscriptionIdSchema.safeParse({ id: req.params.id });
            if (!idValidation.success) {
                logger.warn(`Subscription ID validation failed - ID: ${req.params.id}`);
                const validationError = createValidationErrorResponse(idValidation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            // Validate request body
            const bodyValidation = updateSubscriptionSchema.safeParse(data);
            if (!bodyValidation.success) {
                logger.warn('Subscription update failed validation');
                const validationError = createValidationErrorResponse(bodyValidation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const result = await SubscriptionService.updateSubscription(req.params.id, bodyValidation.data);
            
            if (result.success) {
                logger.info(`Successfully updated subscription - ID: ${result.data.id}`);
                return response.success(
                    res,
                    {
                        subscription: result.data,
                    },
                    result.message
                );
            }
            
            // Handle service errors
            switch (result.errorType) {
                case 'NOT_FOUND':
                    return response.notFound(
                        res,
                        result.message
                    );
                default:
                    return response.internalServerError(
                        res,
                        result.message
                    );
            }
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in updateSubscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }

    static async deleteSubscription(req: Request, res: Response) {
        try {
            logger.info(`Deleting subscription - ID: ${req.params.id}`);
            
            // Check if ID exists
            if (!req.params.id) {
                return response.badRequest(
                    res,
                    "ID subscription wajib diisi"
                );
            }
            
            const data: iSubscriptionId = {
                id: req.params.id
            };
            
            // Validate ID
            const validation = subscriptionIdSchema.safeParse(data);
            if (!validation.success) {
                logger.warn(`Subscription ID validation failed - ID: ${data.id}`);
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const result = await SubscriptionService.deleteSubscription(data);
            
            if (result.success) {
                logger.info(`Successfully deleted subscription - ID: ${result.data.id}`);
                return response.success(
                    res,
                    {
                        subscription: result.data,
                    },
                    result.message
                );
            }
            
            // Handle service errors
            switch (result.errorType) {
                case 'NOT_FOUND':
                    return response.notFound(
                        res,
                        result.message
                    );
                default:
                    return response.internalServerError(
                        res,
                        result.message
                    );
            }
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in deleteSubscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    static async getUsersBySubscriptionId(req: Request, res: Response) {
        try {
            logger.info(`Fetching users by subscription ID: ${req.params.id}`);
            
            // Check if ID exists
            if (!req.params.id) {
                return response.badRequest(
                    res,
                    "ID subscription wajib diisi"
                );
            }
            
            const subscriptionId = req.params.id;
            
            // Validate subscription ID
            const validation = subscriptionIdSchema.safeParse({ id: subscriptionId });
            if (!validation.success) {
                logger.warn(`Subscription ID validation failed - ID: ${subscriptionId}`);
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const result = await SubscriptionService.getUsersBySubscriptionId(subscriptionId);
            
            if (result.success) {
                logger.info(`Successfully fetched ${result.data.length} users with subscription ID: ${subscriptionId}`);
                return response.success(
                    res,
                    {
                        users: result.data,
                    },
                    result.message
                );
            }
            
            // Handle service errors
            switch (result.errorType) {
                case 'NOT_FOUND':
                    return response.notFound(
                        res,
                        result.message
                    );
                default:
                    return response.internalServerError(
                        res,
                        result.message
                    );
            }
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in getUsersBySubscriptionId: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Process subscription payment
     * This endpoint allows users to pay for a subscription
     */
    static async payForSubscription(req: Request, res: Response) {
        try {
            logger.info('Processing subscription payment');
            
            // Get user ID from JWT token
            const userId = req.user?.id;
            if (!userId) {
                return response.unauthorized(
                    res,
                    "User ID not found in token"
                );
            }
            
            const data: SubscriptionPaymentRequest = req.body;
            
            // Validate request body
            const validation = subscriptionPaymentSchema.safeParse({ body: data });
            if (!validation.success) {
                logger.warn('Subscription payment validation failed');
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const { subscriptionId, paymentMethod, bank, walletProvider } = validation.data.body;
            
            // Process subscription payment using service
            const result = await SubscriptionService.processSubscriptionPayment(
                userId,
                subscriptionId,
                paymentMethod,
                bank,
                walletProvider
            );
            
            if (result.success) {
                logger.info(`Subscription payment successful for user ${userId}`);
                return response.success(
                    res,
                    {
                        payment: result.data
                    },
                    result.message
                );
            }
            
            // Handle service errors
            switch (result.errorType) {
                case 'NOT_FOUND':
                    return response.notFound(
                        res,
                        result.message
                    );
                case 'VALIDATION_ERROR':
                    return response.badRequest(
                        res,
                        result.message
                    );
                default:
                    return response.internalServerError(
                        res,
                        result.message
                    );
            }
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in payForSubscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Handle payment webhook from Midtrans
     * This endpoint receives payment status updates from Midtrans
     */
    static async handlePaymentWebhook(req: Request, res: Response) {
        try {
            logger.info('Received payment webhook from Midtrans');
            
            // Get the raw body for signature verification
            const rawBody = req.body;
            
            // TODO: Verify webhook signature for security
            // This would involve checking the signature header against a hash of the body
            
            // Parse the JSON payload
            let payload;
            try {
                payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
            } catch (error : unknown) {
                console.error(error)
                logger.error('Failed to parse webhook payload');
                return res.status(400).send('Invalid JSON payload');
            }
            
            const { order_id, transaction_status, fraud_status } = payload;
            
            logger.info(`Processing webhook for order ${order_id} with status ${transaction_status}`);
            
            // Check if this is a subscription payment
            if (order_id.startsWith('SUB_')) {
                // Extract user ID and subscription ID from order ID
                const parts = order_id.split('_');
                if (parts.length >= 3) {
                    const subscriptionId = parts[1];
                    const userId = parts[2];
                    
                    // Check if payment was successful
                    if (transaction_status === 'settlement' && fraud_status === 'accept') {
                        // Update user's subscription
                        const userUpdated = await UsersService.updateUserSubscription(userId, subscriptionId);
                        
                        if (userUpdated) {
                            logger.info(`Successfully updated user subscription via webhook - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
                        } else {
                            logger.error(`Failed to update user subscription via webhook - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
                        }
                        
                        // Update payment history status
                        await PaymentHistoryService.updatePaymentHistoryStatus(order_id, 'settlement', payload.transaction_id);
                    } else if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
                        // Update payment history status for failed payments
                        await PaymentHistoryService.updatePaymentHistoryStatus(order_id, transaction_status);
                    }
                }
            }
            
            // Send success response to Midtrans
            res.status(200).send('OK');
            
        } catch (error) {
            logger.error(`Error processing payment webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).send('Internal Server Error');
        }
    }
}