import express, { type Router } from "express";
import UsersController from './users.controller';
import { jwtMiddleware } from '../../middleware';

const usersRouter: Router = express.Router();

// Apply JWT middleware to all routes in this router
usersRouter.use(jwtMiddleware);

// Users routes
usersRouter.get('/', UsersController.getAllUsers);

export default usersRouter;