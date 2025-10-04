import express, { type Router } from "express";
import PaymentHistoryController from './payment-history.controller';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { unifiedAuthMiddleware } from '../../middleware';

const paymentHistoryRouter: Router = express.Router();

// Apply unified auth middleware to all routes in this router
paymentHistoryRouter.use(unifiedAuthMiddleware);

// Public routes (accessible by authenticated users)
paymentHistoryRouter.get('/user/:userId', PaymentHistoryController.getPaymentHistoriesByUserId);

// Admin-only routes
paymentHistoryRouter.use(adminMiddleware);
paymentHistoryRouter.get('/', PaymentHistoryController.getAllPaymentHistories);
paymentHistoryRouter.get('/:id', PaymentHistoryController.getPaymentHistoryById);

export default paymentHistoryRouter;