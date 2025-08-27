import express, { type Router } from 'express';
import authRouter from './modules/auth/auth.router';
import { apiKeyMiddleware } from './middleware';

const appRouter: Router = express.Router();

appRouter.use(apiKeyMiddleware)
appRouter.use('/auth', authRouter);

export default appRouter;