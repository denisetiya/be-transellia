import express, { type Router } from "express";
import SubscriptionController from './subscription.controller';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { jwtMiddleware } from '../../middleware';

const subscriptionRouter: Router = express.Router();


// Public routes (accessible by authenticated users)
subscriptionRouter.get('/', SubscriptionController.getAllSubscriptions);
subscriptionRouter.get('/:id', SubscriptionController.getSubscriptionById);
subscriptionRouter.post('/pay', jwtMiddleware, SubscriptionController.payForSubscription);

// Public routes (accessible without authentication - for webhooks)
subscriptionRouter.post('/webhook', express.raw({ type: 'application/json' }), SubscriptionController.handlePaymentWebhook);

// Admin-only routes
subscriptionRouter.use(adminMiddleware);
subscriptionRouter.get('/:id/users', SubscriptionController.getUsersBySubscriptionId);
subscriptionRouter.post('/', SubscriptionController.createSubscription);
subscriptionRouter.put('/:id', SubscriptionController.updateSubscription);
subscriptionRouter.delete('/:id', SubscriptionController.deleteSubscription);

export default subscriptionRouter;