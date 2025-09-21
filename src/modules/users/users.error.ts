import logger from '../../lib/lib.logger';
import { type UsersError, UsersErrorType } from './users.type';

export default class UsersErrorHandler {

    /**
     * Create standardized error response for service layer
     */
    static createServiceError(
        errorType: UsersErrorType,
        message: string
    ): UsersError {
        logger.warn(`Users service error - Type: ${errorType}, Message: ${message}`);

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
    static handleDatabaseError(error: unknown, operation: string): UsersError {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Database error during ${operation} - Error: ${errorMessage}`);

        if (error instanceof Error) {
            // Handle connection errors
            if (error.message.includes('connection')) {
                return this.createServiceError(
                    UsersErrorType.DATABASE_CONNECTION,
                    "Koneksi database bermasalah. Silakan coba lagi."
                );
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                return this.createServiceError(
                    UsersErrorType.TIMEOUT,
                    "Request timeout. Silakan coba lagi."
                );
            }
        }

        // Default error response
        return this.createServiceError(
            UsersErrorType.INTERNAL_ERROR,
            "Terjadi kesalahan sistem. Silakan coba lagi."
        );
    }

    /**
     * Create standard error responses for common users scenarios
     */
    static readonly errors = {
        unauthorized: () => 
            this.createServiceError(
                UsersErrorType.UNAUTHORIZED,
                "Anda tidak memiliki izin untuk mengakses resource ini."
            ),

        internalError: () => 
            this.createServiceError(
                UsersErrorType.INTERNAL_ERROR,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            )
    };
}