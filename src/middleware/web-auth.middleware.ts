import type { Request, Response, NextFunction } from 'express';
import type { iUser } from '../modules/auth/auth.type';
import './middleware.types'; // Import to make Express Request augmentation available
import Jwt from '../lib/lib.jwt';
import env from '../config/env.config';
import logger from '../lib/lib.logger';
import response from '../lib/lib.response';

/**
 * Web Authentication Middleware
 * Handles authentication from both Authorization header (Bearer token) and HTTP-only cookies
 * This is specifically designed for web clients that can store tokens in cookies
 */
export const webAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let token: string | null = null;
        let tokenSource: string = '';

        // First, try to get token from Authorization header (for API clients)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            tokenSource = 'Authorization header';
        }

        // If no token in header, try to get from cookies (for web clients)
        if (!token && req.headers.cookie) {
            // Simple cookie parsing without external dependency
            const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
                const parts = cookie.trim().split('=');
                if (parts.length === 2) {
                    const key = parts[0] as string;
                    const value = parts[1] as string;
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);
            
            if (cookies.transellia_token) {
                token = cookies.transellia_token;
                tokenSource = 'HTTP-only cookie';
            }
        }

        logger.info(`Web auth validation attempt from IP: ${req.ip}, Path: ${req.path}, Token source: ${tokenSource || 'none'}`);

        if (!token) {
            logger.warn(`No token found - IP: ${req.ip}, Path: ${req.path}`);
            response.unauthorized(
                res,
                'Akses ditolak. Autentikasi diperlukan.'
            );
            return;
        }

        if (!token || token.trim() === '') {
            logger.warn(`Empty token provided - IP: ${req.ip}, Source: ${tokenSource}`);
            response.unauthorized(
                res,
                'Token tidak boleh kosong'
            );
            return;
        }

        const decoded = Jwt.verify(token, env.JWT_SECRET);

        if (!decoded) {
            logger.warn(`JWT verification failed - IP: ${req.ip}, Token: ${token.substring(0, 20)}..., Source: ${tokenSource}`);
            response.unauthorized(
                res,
                'Token tidak valid atau sudah kedaluwarsa'
            );
            return;
        }

        const userData = decoded as iUser;
        
        if (!userData.id || !userData.email) {
            logger.warn(`Invalid token payload - IP: ${req.ip}, UserID: ${userData.id || 'missing'}, Email: ${userData.email || 'missing'}, Source: ${tokenSource}`);
            response.unauthorized(
                res,
                'Token berisi data yang tidak valid'
            );
            return;
        }

        req.user = userData;

        logger.info(`Web auth validation successful - UserID: ${userData.id}, Email: ${userData.email}, IP: ${req.ip}, Source: ${tokenSource}`);

        next();

    } catch (error) {
        logger.error(`Web auth middleware error - IP: ${req.ip}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        response.internalServerError(
            res,
            'Terjadi kesalahan sistem saat validasi token'
        );
        return;
    }
};

/**
 * Optional Web Authentication Middleware
 * Similar to webAuthMiddleware but doesn't require authentication
 * Will set req.user if valid token is found, but continues regardless
 */
export const optionalWebAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let token: string | null = null;
        let tokenSource: string = '';

        // First, try to get token from Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            tokenSource = 'Authorization header';
        }

        // If no token in header, try to get from cookies
        if (!token && req.headers.cookie) {
            // Simple cookie parsing without external dependency
            const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
                const parts = cookie.trim().split('=');
                if (parts.length === 2) {
                    const key = parts[0] as string;
                    const value = parts[1] as string;
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);
            
            if (cookies.transellia_token) {
                token = cookies.transellia_token;
                tokenSource = 'HTTP-only cookie';
            }
        }

        if (!token) {
            logger.info(`Optional web auth: No token provided - IP: ${req.ip}, Path: ${req.path}`);
            next();
            return;
        }

        if (!token || token.trim() === '') {
            next();
            return;
        }

        const decoded = Jwt.verify(token, env.JWT_SECRET);
        
        if (decoded && decoded.id && decoded.email) {
            req.user = decoded as iUser;
            logger.info(`Optional web auth validation successful - UserID: ${decoded.id}, Email: ${decoded.email}, IP: ${req.ip}, Source: ${tokenSource}`);
        } else {
            logger.info(`Optional web auth: Invalid token provided - IP: ${req.ip}, Source: ${tokenSource}`);
        }

        next();

    } catch (error) {
        logger.warn(`Optional web auth middleware error - IP: ${req.ip}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        next();
    }
};

export default webAuthMiddleware;