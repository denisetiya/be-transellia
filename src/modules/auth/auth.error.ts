import type { Response } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import { type AuthError, AuthErrorType } from './auth.type';


/**
 * Auth Error Handler Class
 * Centralized error handling for authentication operations
 */
export default class AuthErrorHandler {

    /**
     * Create standardized error response for service layer
     */
    static createServiceError(
        errorType: AuthErrorType,
        message: string,
        email?: string
    ): AuthError {
        if (email) {
            logger.warn(`Auth service error - Email: ${email}, Type: ${errorType}, Message: ${message}`);
        } else {
            logger.warn(`Auth service error - Type: ${errorType}, Message: ${message}`);
        }

        return {
            data: null,
            message,
            success: false,
            errorType
        };
    }

    /**
     * Handle database errors in service layer
     */
    static handleDatabaseError(error: unknown, email: string, operation: 'login' | 'registration'): AuthError {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Database error during ${operation} - Error: ${errorMessage}, Email: ${email}`);

        if (error instanceof Error) {
            // Handle unique constraint error (for registration)
            if (error.message.includes('Unique constraint')) {
                return this.createServiceError(
                    AuthErrorType.EMAIL_ALREADY_EXISTS,
                    "Email sudah terdaftar. Silakan gunakan email lain.",
                    email
                );
            }
            
            // Handle connection errors
            if (error.message.includes('connection')) {
                return this.createServiceError(
                    AuthErrorType.DATABASE_CONNECTION,
                    "Koneksi database bermasalah. Silakan coba lagi.",
                    email
                );
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                return this.createServiceError(
                    AuthErrorType.TIMEOUT,
                    "Request timeout. Silakan coba lagi.",
                    email
                );
            }

            // Handle foreign key constraint errors
            if (error.message.includes('Foreign key constraint')) {
                return this.createServiceError(
                    AuthErrorType.FOREIGN_KEY_ERROR,
                    "Data referensi tidak valid. Silakan coba lagi.",
                    email
                );
            }
        }

        // Default error response
        return this.createServiceError(
            AuthErrorType.INTERNAL_ERROR,
            "Terjadi kesalahan sistem. Silakan coba lagi.",
            email
        );
    }

    /**
     * Handle controller-level service errors
     * Maps service error types to appropriate HTTP responses
     */
    static handleControllerServiceError(
        res: Response, 
        serviceResult: AuthError, 
        email: string
    ): void {
        const { message, errorType } = serviceResult;
        
        logger.warn(`Controller handling service error - Email: ${email}, Type: ${errorType}, Message: ${message}`);
        
        switch (errorType) {
            case AuthErrorType.INVALID_CREDENTIALS:
            case AuthErrorType.USER_NOT_FOUND:
                response.unauthorized(res, message);
                break;
            
            case AuthErrorType.CONFLICT:
            case AuthErrorType.EMAIL_ALREADY_EXISTS:
                response.conflict(res, message);
                break;
            
            case AuthErrorType.DATABASE_CONNECTION:
            case AuthErrorType.TIMEOUT:
            case AuthErrorType.INTERNAL_ERROR:
                response.internalServerError(res, message);
                break;
            
            case AuthErrorType.FOREIGN_KEY_ERROR:
            case AuthErrorType.VALIDATION_ERROR:
                response.badRequest(res, message);
                break;
            
            default:
                // Fallback for unknown error types
                logger.error(`Unknown service error type: ${errorType} - Email: ${email}`);
                response.internalServerError(
                    res, 
                    'Terjadi kesalahan sistem. Silakan coba lagi.'
                );
                break;
        }
    }

    /**
     * Handle controller-level unexpected exceptions
     * Handles try-catch exceptions consistently
     */
    static handleControllerException(
        res: Response, 
        error: unknown, 
        operation: 'login' | 'registration', 
        email: string
    ): void {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Unexpected error during ${operation} - Error: ${errorMessage}, Email: ${email}`);
        
        response.internalServerError(
            res,
            'Terjadi kesalahan sistem. Silakan coba lagi.',
            process.env.NODE_ENV === 'development' ? errorMessage : null
        );
    }

    /**
     * Create standard error responses for common auth scenarios
     */
    static readonly errors = {
        invalidCredentials: (email?: string) => 
            this.createServiceError(
                AuthErrorType.INVALID_CREDENTIALS,
                "Email atau password salah. Silakan coba lagi.",
                email
            ),

        userNotFound: (email?: string) => 
            this.createServiceError(
                AuthErrorType.USER_NOT_FOUND,
                "User tidak ditemukan.",
                email
            ),

        emailAlreadyExists: (email?: string) => 
            this.createServiceError(
                AuthErrorType.EMAIL_ALREADY_EXISTS,
                "Email sudah terdaftar. Silakan gunakan email lain atau login.",
                email
            ),

        validationError: (message: string, email?: string) => 
            this.createServiceError(
                AuthErrorType.VALIDATION_ERROR,
                message,
                email
            ),

        internalError: (email?: string) => 
            this.createServiceError(
                AuthErrorType.INTERNAL_ERROR,
                "Terjadi kesalahan sistem. Silakan coba lagi.",
                email
            )
    };
}