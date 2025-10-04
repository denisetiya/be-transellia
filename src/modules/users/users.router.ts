import express, { type Router } from "express";
import UsersController from './users.controller';
import { unifiedAuthMiddleware } from '../../middleware';
import adminMiddleware from "@/middleware/admin.middleware";

const usersRouter: Router = express.Router();

// Apply unified auth middleware to all routes in this router
usersRouter.use(unifiedAuthMiddleware);

// Users routes
usersRouter.get('/me', UsersController.getMyProfile);


// Admin CRUD routes for users
usersRouter.use(adminMiddleware)

usersRouter.get('/', UsersController.getAllUsers);
usersRouter.get('/:id', UsersController.getUserById);
usersRouter.post('/', UsersController.createUser);
usersRouter.put('/:id', UsersController.updateUser);
usersRouter.delete('/:id', UsersController.deleteUser);
usersRouter.patch('/:id/subscription', UsersController.updateUserSubscription);

export default usersRouter;