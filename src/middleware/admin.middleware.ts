import type { Request, Response, NextFunction } from 'express';
import logger from '../lib/lib.logger';
import response from '../lib/lib.response';
import type { iUser } from '../modules/auth/auth.type';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            logger.warn(`Unauthorized access attempt - No user authenticated - IP: ${req.ip}, Path: ${req.path}`);
            response.unauthorized(
                res,
                'Akses ditolak. Autentikasi diperlukan.'
            );
            return;
        }

        // Check if user has admin role
        if (req.user.role !== 'ADMIN') {
            logger.warn(`Forbidden access attempt - User ID: ${req.user.id}, Role: ${req.user.role}, IP: ${req.ip}, Path: ${req.path}`);
            response.forbidden(
                res,
                'Akses ditolak. Hak akses admin diperlukan.'
            );
            return;
        }

        logger.info(`Admin authorization successful - UserID: ${req.user.id}, IP: ${req.ip}`);
        next();

    } catch (error) {
        logger.error(`Admin middleware error - IP: ${req.ip}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        response.internalServerError(
            res,
            'Terjadi kesalahan sistem saat validasi hak akses'
        );
        return;
    }
};

export default adminMiddleware;