import type { Request, Response, NextFunction } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import { AuthServiceError, AuthErrorTypes } from './auth.errors';

// Define interfaces for proper typing
interface PrismaError extends Error {
    code: string;
    meta?: Record<string, unknown>;
}

interface ZodIssue {
    path: (string | number)[];
    message: string;
}

interface ZodError extends Error {
    issues: ZodIssue[];
}

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        isEmployee: boolean;
        [key: string]: unknown;
    };
}

export class AuthMiddleware {
    
    /**
     * Global error handler for authentication-related errors
     */
    static errorHandler(error: Error, req: Request, res: Response) {
        logger.error(`Auth error occurred: ${error.message} - URL: ${req.url} - Method: ${req.method} - IP: ${req.ip}`);

        // Handle custom AuthServiceError
        if (error instanceof AuthServiceError) {
            switch (error.type) {
                case AuthErrorTypes.INVALID_CREDENTIALS:
                case AuthErrorTypes.INVALID_TOKEN:
                case AuthErrorTypes.TOKEN_EXPIRED:
                    return response.unauthorized(res, error.message);

                case AuthErrorTypes.USER_NOT_FOUND:
                    return response.notFound(res, error.message);

                case AuthErrorTypes.EMAIL_ALREADY_EXISTS:
                    return response.conflict(res, error.message);

                case AuthErrorTypes.VALIDATION_ERROR:
                case AuthErrorTypes.WEAK_PASSWORD:
                case AuthErrorTypes.FOREIGN_KEY_ERROR:
                    return response.badRequest(
                        res, 
                        error.message, 
                        error.details as Record<string, unknown> | Record<string, unknown>[] | string | null
                    );

                case AuthErrorTypes.TIMEOUT:
                    return response.internalServerError(res, error.message, null);

                case AuthErrorTypes.DATABASE_CONNECTION:
                    return response.internalServerError(res, 'Layanan sedang tidak tersedia. Silakan coba lagi.');

                case AuthErrorTypes.INTERNAL_ERROR:
                default:
                    return response.internalServerError(res, error.message);
            }
        }

        // Handle Prisma errors
        if (error.name === 'PrismaClientKnownRequestError') {
            const prismaError = error as unknown as PrismaError;
            
            switch (prismaError.code) {
                case 'P2002': // Unique constraint violation
                    return response.conflict(res, 'Data sudah ada. Silakan gunakan data yang berbeda.');
                
                case 'P2025': // Record not found
                    return response.notFound(res, 'Data tidak ditemukan.');
                
                case 'P2003': // Foreign key constraint violation
                    return response.badRequest(res, 'Data referensi tidak valid.');
                
                case 'P1001': // Database connection error
                    return response.internalServerError(res, 'Koneksi database bermasalah.');
                
                default:
                    logger.error(`Unhandled Prisma error: ${prismaError.code} - ${JSON.stringify(prismaError.meta)}`);
                    return response.internalServerError(res, 'Terjadi kesalahan database.');
            }
        }

        // Handle JWT errors
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, 'Token tidak valid.');
        }

        if (error.name === 'TokenExpiredError') {
            return response.unauthorized(res, 'Token sudah kadaluarsa. Silakan login ulang.');
        }

        // Handle validation errors (Zod)
        if (error.name === 'ZodError') {
            const zodError = error as unknown as ZodError;
            const formattedErrors = zodError.issues.map((issue: ZodIssue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            
            return response.badRequest(res, 'Data tidak valid.', formattedErrors);
        }

        // Handle generic errors
        logger.error(`Unhandled error in auth middleware: ${error.name} - ${error.message}`);

        return response.internalServerError(
            res,
            'Terjadi kesalahan sistem. Silakan coba lagi.',
            process.env.NODE_ENV === 'development' ? error.message : null
        );
    }

    /**
     * Middleware to validate JWT token
     */
    static async validateToken(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw AuthServiceError.invalidToken('Token tidak ditemukan atau format tidak valid.');
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            
            // Import JWT library
            const Jwt = (await import('../../lib/lib.jwt')).default;
            const env = (await import('../../config/env.config')).default;
            
            // Verify token
            const decoded = Jwt.verify(token, env.JWT_SECRET);
            
            if (!decoded) {
                throw AuthServiceError.invalidToken();
            }

            // Add user info to request
            (req as AuthenticatedRequest).user = decoded;
            
            next();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Middleware to validate user roles
     */
    static requireRole(roles: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = (req as AuthenticatedRequest).user;
                
                if (!user) {
                    throw AuthServiceError.invalidToken('User tidak terautentikasi.');
                }

                if (!roles.includes(user.role)) {
                    return response.forbidden(res, 'Akses ditolak. Role tidak memiliki izin.');
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Middleware to validate employee access
     */
    static requireEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as AuthenticatedRequest).user;
            
            if (!user) {
                throw AuthServiceError.invalidToken('User tidak terautentikasi.');
            }

            if (!user.isEmployee) {
                return response.forbidden(res, 'Akses ditolak. Hanya untuk karyawan.');
            }

            next();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Rate limiting for auth endpoints
     */
    static rateLimitAuth() {
        const attempts = new Map<string, { count: number; resetTime: number }>();
        const MAX_ATTEMPTS = 5;
        const RESET_TIME = 15 * 60 * 1000; // 15 minutes

        return (req: Request, res: Response, next: NextFunction) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const now = Date.now();
            
            const userAttempts = attempts.get(ip);
            
            if (userAttempts) {
                if (now > userAttempts.resetTime) {
                    attempts.delete(ip);
                } else if (userAttempts.count >= MAX_ATTEMPTS) {
                    logger.warn(`Rate limit exceeded for auth endpoint - IP: ${ip}, Attempts: ${userAttempts.count}`);
                    return response.internalServerError(
                        res,
                        `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((userAttempts.resetTime - now) / 60000)} menit.`
                    );
                }
            }

            next();
            
            // Increment attempts after request (for failed attempts)
            const current = attempts.get(ip) || { count: 0, resetTime: now + RESET_TIME };
            attempts.set(ip, {
                count: current.count + 1,
                resetTime: current.resetTime
            });
        };
    }
}