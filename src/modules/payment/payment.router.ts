import express, { type Router } from "express";
import PaymentController from './payment.controller';
import { jwtMiddleware } from '../../middleware';

const paymentRouter: Router = express.Router();

// Apply JWT middleware to all routes in this router
paymentRouter.use(jwtMiddleware);

// Payment routes
paymentRouter.post('/', PaymentController.createPayment);
paymentRouter.get('/:orderId', PaymentController.getPaymentStatus);

export default paymentRouter;