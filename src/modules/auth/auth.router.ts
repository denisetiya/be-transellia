import express, { type Router } from "express";
import AuthController from './auth.controller';

const authRouter: Router = express.Router();

// Auth routes
authRouter.post('/login', AuthController.login);
authRouter.post('/register', AuthController.register);

// Protected routes example (uncomment when needed)
// authRouter.get('/profile', AuthController.getProfile);
// authRouter.put('/profile', AuthController.updateProfile);
// authRouter.post('/logout', AuthController.logout);

export default authRouter;

