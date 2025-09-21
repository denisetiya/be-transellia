import express, { type Router } from 'express';
import authRouter from './modules/auth/auth.router';
import subscriptionRouter from './modules/subscription/subscription.router';
import usersRouter from './modules/users/users.router';
import paymentRouter from './modules/payment/payment.router';
import { apiKeyMiddleware } from './middleware';

const appRouter: Router = express.Router();

appRouter.use(apiKeyMiddleware)
appRouter.use('/auth', authRouter);
appRouter.use('/subscriptions', subscriptionRouter);
appRouter.use('/users', usersRouter);
appRouter.use('/payments', paymentRouter);

export default appRouter;