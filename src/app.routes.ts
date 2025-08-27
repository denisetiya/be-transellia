import express , { type Router } from 'express';
import authRouter from './modules/auth/auth.router';

const appRouter : Router = express.Router();


appRouter.use('/auth', authRouter);


export default appRouter;