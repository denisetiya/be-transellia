import express, { type Router } from "express";
import SubscriptionController from './subscription.controller';

const subscriptionRouter: Router = express.Router();

// Subscription routes
subscriptionRouter.get('/', SubscriptionController.getAllSubscriptions);
subscriptionRouter.get('/:id', SubscriptionController.getSubscriptionById);
subscriptionRouter.get('/:id/users', SubscriptionController.getUsersBySubscriptionId);
subscriptionRouter.post('/', SubscriptionController.createSubscription);
subscriptionRouter.put('/:id', SubscriptionController.updateSubscription);
subscriptionRouter.delete('/:id', SubscriptionController.deleteSubscription);

export default subscriptionRouter;