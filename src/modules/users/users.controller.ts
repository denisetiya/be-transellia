import type { Request, Response } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import UsersService from './users.service';
import { createValidationErrorResponse } from '../../lib/lib.validation';
import {
    getUsersSchema,
    getUserByIdSchema,
    createUserSchema,
    updateUserSchema,
    updateUserSubscriptionSchema
} from './users.validation';

export default class UsersController {

    static async getAllUsers(req: Request, res: Response) {
        try {
            logger.info('Fetching all users with pagination');
            
            // Check if user is admin
            const userRole = req.user?.role;
            if (userRole !== 'ADMIN') {
                logger.warn(`Unauthorized access attempt to users list - User ID: ${req.user?.id}, Role: ${userRole}`);
                return response.forbidden(
                    res,
                    "Anda tidak memiliki izin untuk mengakses daftar pengguna."
                );
            }
            
            // Extract and validate pagination parameters from query
            const validation = getUsersSchema.safeParse(req.query);
            if (!validation.success) {
                logger.warn('Users pagination validation failed');
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const { page, limit } = validation.data;
            
            const result = await UsersService.getAllUsers(page, limit);
            
            if (result.success) {
                logger.info(`Successfully fetched ${result.data.length} users (Page: ${page}, Limit: ${limit})`);
                return response.success(
                    res,
                    {
                        users: result.data,
                    },
                    result.message,
                    result.meta
                );
            }
            
            // Handle service errors
            return response.internalServerError(
                res,
                result.message
            );
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in getAllUsers: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Get current user's profile information
     * This endpoint returns the authenticated user's details based on the JWT token
     */
    static async getMyProfile(req: Request, res: Response) {
        try {
            logger.info('Fetching current user profile');
            
            // Get user ID from JWT token
            const userId = req.user?.id;
            if (!userId) {
                return response.unauthorized(
                    res,
                    "User ID not found in token"
                );
            }
            
            // Get user details
            const user = await UsersService.getUserById(userId);
            
            if (!user) {
                logger.warn(`User not found - User ID: ${userId}`);
                return response.notFound(
                    res,
                    "User not found"
                );
            }
            
            logger.info(`Successfully fetched user profile - User ID: ${userId}`);
            return response.success(
                res,
                {
                    user: user
                },
                "Berhasil mendapatkan profil pengguna"
            );
            
        } catch (error) {
            // Handle unexpected exceptions
            logger.error(`Unexpected error in getMyProfile: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Get a user by ID (Admin only)
     */
    static async getUserById(req: Request, res: Response) {
        try {
            logger.info('Fetching user by ID');
            
            // Check if user is admin
            const userRole = req.user?.role;
            if (userRole !== 'ADMIN') {
                logger.warn(`Unauthorized access attempt to get user by ID - User ID: ${req.user?.id}, Role: ${userRole}`);
                return response.forbidden(
                    res,
                    "Anda tidak memiliki izin untuk mengakses detail pengguna."
                );
            }
            
            // Validate user ID
            const validation = getUserByIdSchema.safeParse(req.params);
            if (!validation.success) {
                logger.warn('User ID validation failed');
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const { id } = validation.data;
            
            // Get user details
            const user = await UsersService.getUserById(id);
            
            if (!user) {
                logger.warn(`User not found - ID: ${id}`);
                return response.notFound(
                    res,
                    "Pengguna tidak ditemukan"
                );
            }
            
            logger.info(`Successfully fetched user - ID: ${id}`);
            return response.success(
                res,
                {
                    user: user
                },
                "Berhasil mendapatkan detail pengguna"
            );
            
        } catch (error) {
            logger.error(`Unexpected error in getUserById: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Create a new user (Admin only)
     */
    static async createUser(req: Request, res: Response) {
        try {
            logger.info('Creating new user');
            
            // Check if user is admin
            const userRole = req.user?.role;
            if (userRole !== 'ADMIN') {
                logger.warn(`Unauthorized access attempt to create user - User ID: ${req.user?.id}, Role: ${userRole}`);
                return response.forbidden(
                    res,
                    "Anda tidak memiliki izin untuk membuat pengguna baru."
                );
            }
            
            // Validate request body
            const validation = createUserSchema.safeParse(req.body);
            if (!validation.success) {
                logger.warn('User creation validation failed');
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const userData = validation.data;
            
            // Create user
            const result = await UsersService.createUser(userData);
            
            if (result.success) {
                logger.info(`Successfully created user - ID: ${result.data.id}, Email: ${result.data.email}`);
                return res.status(201).json({
                    success: true,
                    message: result.message,
                    content: {
                        user: result.data
                    }
                });
            }
            
            // Handle service errors
            if (result.errorType === 'INTERNAL_ERROR') {
                return response.internalServerError(
                    res,
                    result.message
                );
            }
            
            return response.badRequest(
                res,
                result.message
            );
            
        } catch (error) {
            logger.error(`Unexpected error in createUser: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Update a user (Admin only)
     */
    static async updateUser(req: Request, res: Response) {
        try {
            logger.info('Updating user');
            
            // Check if user is admin
            const userRole = req.user?.role;
            if (userRole !== 'ADMIN') {
                logger.warn(`Unauthorized access attempt to update user - User ID: ${req.user?.id}, Role: ${userRole}`);
                return response.forbidden(
                    res,
                    "Anda tidak memiliki izin untuk memperbarui pengguna."
                );
            }
            
            // Validate user ID
            const idValidation = getUserByIdSchema.safeParse(req.params);
            if (!idValidation.success) {
                logger.warn('User ID validation failed');
                const validationError = createValidationErrorResponse(idValidation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            // Validate request body
            const bodyValidation = updateUserSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                logger.warn('User update validation failed');
                const validationError = createValidationErrorResponse(bodyValidation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const { id } = idValidation.data;
            const updateData = bodyValidation.data;
            
            // Update user
            const result = await UsersService.updateUser(id, updateData);
            
            if (result.success) {
                logger.info(`Successfully updated user - ID: ${id}`);
                return response.success(
                    res,
                    {
                        user: result.data
                    },
                    result.message
                );
            }
            
            // Handle service errors
            if (result.errorType === 'INTERNAL_ERROR') {
                return response.internalServerError(
                    res,
                    result.message
                );
            }
            
            return response.badRequest(
                res,
                result.message
            );
            
        } catch (error) {
            logger.error(`Unexpected error in updateUser: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Delete a user (Admin only)
     */
    static async deleteUser(req: Request, res: Response) {
        try {
            logger.info('Deleting user');
            
            // Check if user is admin
            const userRole = req.user?.role;
            if (userRole !== 'ADMIN') {
                logger.warn(`Unauthorized access attempt to delete user - User ID: ${req.user?.id}, Role: ${userRole}`);
                return response.forbidden(
                    res,
                    "Anda tidak memiliki izin untuk menghapus pengguna."
                );
            }
            
            // Validate user ID
            const validation = getUserByIdSchema.safeParse(req.params);
            if (!validation.success) {
                logger.warn('User ID validation failed');
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const { id } = validation.data;
            
            // Prevent admin from deleting themselves
            if (id === req.user?.id) {
                logger.warn(`Admin attempted to delete themselves - User ID: ${id}`);
                return response.badRequest(
                    res,
                    "Anda tidak dapat menghapus akun Anda sendiri."
                );
            }
            
            // Delete user
            const result = await UsersService.deleteUser(id);
            
            if (result.success) {
                logger.info(`Successfully deleted user - ID: ${id}`);
                return response.success(
                    res,
                    null,
                    result.message
                );
            }
            
            // Handle service errors
            if (result.errorType === 'INTERNAL_ERROR') {
                return response.internalServerError(
                    res,
                    result.message
                );
            }
            
            return response.badRequest(
                res,
                result.message
            );
            
        } catch (error) {
            logger.error(`Unexpected error in deleteUser: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
    
    /**
     * Update user subscription (Admin only)
     */
    static async updateUserSubscription(req: Request, res: Response) {
        try {
            logger.info('Updating user subscription');
            
            // Check if user is admin
            const userRole = req.user?.role;
            if (userRole !== 'ADMIN') {
                logger.warn(`Unauthorized access attempt to update user subscription - User ID: ${req.user?.id}, Role: ${userRole}`);
                return response.forbidden(
                    res,
                    "Anda tidak memiliki izin untuk memperbarui langganan pengguna."
                );
            }
            
            // Validate user ID
            const idValidation = getUserByIdSchema.safeParse(req.params);
            if (!idValidation.success) {
                logger.warn('User ID validation failed');
                const validationError = createValidationErrorResponse(idValidation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            // Validate request body
            const bodyValidation = updateUserSubscriptionSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                logger.warn('User subscription update validation failed');
                const validationError = createValidationErrorResponse(bodyValidation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }
            
            const { id } = idValidation.data;
            const { subscriptionId } = bodyValidation.data;
            
            // Update user subscription
            const success = await UsersService.updateUserSubscription(id, subscriptionId || '');
            
            if (success) {
                logger.info(`Successfully updated user subscription - User ID: ${id}, Subscription ID: ${subscriptionId}`);
                return response.success(
                    res,
                    null,
                    "Berhasil memperbarui langganan pengguna"
                );
            }
            
            logger.error(`Failed to update user subscription - User ID: ${id}, Subscription ID: ${subscriptionId}`);
            return response.internalServerError(
                res,
                "Gagal memperbarui langganan pengguna"
            );
            
        } catch (error) {
            logger.error(`Unexpected error in updateUserSubscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return response.internalServerError(
                res,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            );
        }
    }
}