import logger from '../../lib/lib.logger';
import { type SubscriptionError, SubscriptionErrorType } from './subscription.type';

export default class SubscriptionErrorHandler {

    /**
     * Create standardized error response for service layer
     */
    static createServiceError(
        errorType: SubscriptionErrorType,
        message: string,
        id?: string
    ): SubscriptionError {
        if (id) {
            logger.warn(`Subscription service error - ID: ${id}, Type: ${errorType}, Message: ${message}`);
        } else {
            logger.warn(`Subscription service error - Type: ${errorType}, Message: ${message}`);
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
    static handleDatabaseError(error: unknown, operation: string): SubscriptionError {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Database error during ${operation} - Error: ${errorMessage}`);

        if (error instanceof Error) {
            // Handle connection errors
            if (error.message.includes('connection')) {
                return this.createServiceError(
                    SubscriptionErrorType.DATABASE_CONNECTION,
                    "Koneksi database bermasalah. Silakan coba lagi."
                );
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                return this.createServiceError(
                    SubscriptionErrorType.TIMEOUT,
                    "Request timeout. Silakan coba lagi."
                );
            }
        }

        // Default error response
        return this.createServiceError(
            SubscriptionErrorType.INTERNAL_ERROR,
            "Terjadi kesalahan sistem. Silakan coba lagi."
        );
    }

    /**
     * Create standard error responses for common subscription scenarios
     */
    static readonly errors = {
        notFound: (id?: string) => 
            this.createServiceError(
                SubscriptionErrorType.NOT_FOUND,
                "Subscription tidak ditemukan.",
                id
            ),

        validationError: (message: string) => 
            this.createServiceError(
                SubscriptionErrorType.VALIDATION_ERROR,
                message
            ),

        internalError: () => 
            this.createServiceError(
                SubscriptionErrorType.INTERNAL_ERROR,
                "Terjadi kesalahan sistem. Silakan coba lagi."
            )
    };
}