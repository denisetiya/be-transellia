import express, { type Router } from "express";
import PaymentController from './payment.controller';
import { unifiedAuthMiddleware } from '../../middleware';

const paymentRouter: Router = express.Router();

// Apply unified auth middleware to all routes in this router
paymentRouter.use(unifiedAuthMiddleware);

// Payment routes
paymentRouter.post('/', PaymentController.createPayment);
paymentRouter.get('/:orderId', PaymentController.getPaymentStatus);

export default paymentRouter;