import type { Request, Response } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import UsersService from './users.service';
import { createValidationErrorResponse } from '../../lib/lib.validation';
import { getUsersSchema } from './users.validation';

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
}