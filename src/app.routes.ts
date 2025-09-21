import express, { type Router } from 'express';
import authRouter from './modules/auth/auth.router';
import subscriptionRouter from './modules/subscription/subscription.router';
import { apiKeyMiddleware } from './middleware';

const appRouter: Router = express.Router();

appRouter.use(apiKeyMiddleware)
appRouter.use('/auth', authRouter);
appRouter.use('/subscriptions', subscriptionRouter);

export default appRouter;