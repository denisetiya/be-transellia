import express, { type Router } from "express";
import SubscriptionController from './subscription.controller';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { unifiedAuthMiddleware } from '../../middleware';

const subscriptionRouter: Router = express.Router();

// Public routes (accessible by authenticated users)
subscriptionRouter.get('/', SubscriptionController.getAllSubscriptions);
subscriptionRouter.get('/:id', SubscriptionController.getSubscriptionById);

// Payment routes - use unified auth middleware to support both header and cookie authentication
subscriptionRouter.post('/pay', unifiedAuthMiddleware, SubscriptionController.payForSubscription);

// Public routes (accessible without authentication - for webhooks)
subscriptionRouter.post('/webhook', express.raw({ type: 'application/json' }), SubscriptionController.handlePaymentWebhook);

// Admin-only routes - use unified auth middleware to support both header and cookie authentication
subscriptionRouter.use(unifiedAuthMiddleware, adminMiddleware);
subscriptionRouter.get('/:id/users', SubscriptionController.getUsersBySubscriptionId);
subscriptionRouter.post('/', SubscriptionController.createSubscription);
subscriptionRouter.put('/:id', SubscriptionController.updateSubscription);
subscriptionRouter.delete('/:id', SubscriptionController.deleteSubscription);

export default subscriptionRouter;