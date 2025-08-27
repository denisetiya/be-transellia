import type { Request, Response, NextFunction } from 'express';
import type { iUser } from '../modules/auth/auth.type';
import './middleware.types'; // Import to make Express Request augmentation available
import Jwt from '../lib/lib.jwt';
import env from '../config/env.config';
import logger from '../lib/lib.logger';
import response from '../lib/lib.response';


export const jwtMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        logger.info(`JWT validation attempt from IP: ${req.ip}, Path: ${req.path}`);

        if (!authHeader) {
            logger.warn(`Authorization header missing - IP: ${req.ip}, Path: ${req.path}`);
            response.unauthorized(
                res,
                'Token akses wajib disertakan'
            );
            return;
        }

        if (!authHeader.startsWith('Bearer ')) {
            logger.warn(`Invalid authorization format - IP: ${req.ip}, Header: ${authHeader.substring(0, 20)}...`);
            response.unauthorized(
                res,
                'Format token tidak valid'
            );
            return;
        }

        const token = authHeader.substring(7); 

 
        if (!token || token.trim() === '') {
            logger.warn(`Empty token provided - IP: ${req.ip}`);
            response.unauthorized(
                res,
                'Token tidak boleh kosong'
            );
            return;
        }

        const decoded = Jwt.verify(token, env.JWT_SECRET);

        if (!decoded) {
            logger.warn(`JWT verification failed - IP: ${req.ip}, Token: ${token.substring(0, 20)}...`);
            response.unauthorized(
                res,
                'Token tidak valid atau sudah kedaluwarsa'
            );
            return;
        }


        const userData = decoded as iUser;
        
        if (!userData.id || !userData.email) {
            logger.warn(`Invalid token payload - IP: ${req.ip}, UserID: ${userData.id || 'missing'}, Email: ${userData.email || 'missing'}`);
            response.unauthorized(
                res,
                'Token berisi data yang tidak valid'
            );
            return;
        }

        req.user = userData;

        logger.info(`JWT validation successful - UserID: ${userData.id}, Email: ${userData.email}, IP: ${req.ip}`);

        next();

    } catch (error) {
        logger.error(`JWT middleware error - IP: ${req.ip}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        response.internalServerError(
            res,
            'Terjadi kesalahan sistem saat validasi token'
        );
        return;
    }
};


export const optionalJwtMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.info(`Optional JWT: No token provided - IP: ${req.ip}, Path: ${req.path}`);
            next();
            return;
        }

        const token = authHeader.substring(7);
        
        if (!token || token.trim() === '') {
            next();
            return;
        }

        const decoded = Jwt.verify(token, env.JWT_SECRET);
        
        if (decoded && decoded.id && decoded.email) {
            req.user = decoded as iUser;
            logger.info(`Optional JWT validation successful - UserID: ${decoded.id}, Email: ${decoded.email}, IP: ${req.ip}`);
        } else {
            logger.info(`Optional JWT: Invalid token provided - IP: ${req.ip}`);
        }

        next();

    } catch (error) {
        logger.warn(`Optional JWT middleware error - IP: ${req.ip}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        next();
    }
};

export default jwtMiddleware;