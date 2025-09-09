import type { Response, Request, NextFunction } from 'express';
import type { ZodError, ZodIssue } from 'zod';
import logger from './lib.logger';
import response from './lib.response';
import { GlobalErrorType, type GlobalError} from '../types/global.error.type'

/**
 * Global Error Handler Class
 * Centralized error handling for the entire application
 */
export default class GlobalErrorHandler {
    
    /**
     * Create standardized error response
     */
    static createError(
        errorType: GlobalErrorType,
        message: string,
        errorCode?: string,
        errors?: Record<string, unknown> | string | null
    ): GlobalError {
        logger.warn(`Global error created - Type: ${errorType}, Message: ${message}, Code: ${errorCode || 'N/A'}`);
        
        return {
            data: null,
            message,
            success: false,
            errorType,
            errorCode,
            errors
        };
    }

    /**
     * Handle Zod validation errors
     */
    static handleZodError(error: ZodError, field?: string): GlobalError {
        const errorMessage = field 
            ? `Validation error in field: ${field}`
            : "Validation error in request";
            
        const errorDetails = error.issues.map((err: ZodIssue) => ({
            path: err.path.join('.'),
            message: err.message
        }));
        
        logger.warn(`Zod validation error - Field: ${field || 'N/A'}, Errors: ${JSON.stringify(errorDetails)}`);
        
        return this.createError(
            GlobalErrorType.VALIDATION_ERROR,
            errorMessage,
            'VALIDATION_ERROR',
            JSON.stringify(errorDetails) // Convert to string to match expected type
        );
    }

    /**
     * Handle database errors
     */
    static handleDatabaseError(error: unknown, operation: string, entity?: string): GlobalError {
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        const entityInfo = entity ? `Entity: ${entity}, ` : '';
        
        logger.error(`Database error during ${operation} - ${entityInfo}Error: ${errorMessage}`);
        
        if (error instanceof Error) {
            // Handle unique constraint error
            if (error.message.includes('Unique constraint') || error.message.includes('duplicate')) {
                return this.createError(
                    GlobalErrorType.CONFLICT,
                    entity 
                        ? `${entity} already exists`
                        : "Resource already exists",
                    'DUPLICATE_ENTRY'
                );
            }
            
            // Handle connection errors
            if (error.message.includes('connection') || error.message.includes('connect')) {
                return this.createError(
                    GlobalErrorType.DATABASE_CONNECTION,
                    "Database connection error",
                    'DB_CONNECTION_ERROR'
                );
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                return this.createError(
                    GlobalErrorType.TIMEOUT,
                    "Database request timeout",
                    'DB_TIMEOUT'
                );
            }

            // Handle foreign key constraint errors
            if (error.message.includes('Foreign key constraint') || error.message.includes('foreign')) {
                return this.createError(
                    GlobalErrorType.FOREIGN_KEY_ERROR,
                    "Referenced resource not found",
                    'FOREIGN_KEY_ERROR'
                );
            }
        }

        // Default database error response
        return this.createError(
            GlobalErrorType.DATABASE_ERROR,
            "Database operation failed",
            'DB_ERROR'
        );
    }

    /**
     * Handle HTTP error responses
     */
    static handleHTTPError(
        res: Response,
        globalError: GlobalError,
        showDetails: boolean = false
    ): void {
        const { message, errorType, errorCode, errors } = globalError;
        
        logger.warn(`HTTP error response - Type: ${errorType}, Message: ${message}, Code: ${errorCode || 'N/A'}`);
        
        switch (errorType) {
            case GlobalErrorType.VALIDATION_ERROR:
                response.badRequest(res, message, errors);
                break;
            
            case GlobalErrorType.UNAUTHORIZED:
                response.unauthorized(res, message);
                break;
            
            case GlobalErrorType.FORBIDDEN:
                response.forbidden(res, message);
                break;
            
            case GlobalErrorType.NOT_FOUND:
                response.notFound(res, message);
                break;
            
            case GlobalErrorType.CONFLICT:
                response.conflict(res, message);
                break;
            
            case GlobalErrorType.DATABASE_CONNECTION:
            case GlobalErrorType.TIMEOUT:
            case GlobalErrorType.INTERNAL_ERROR:
            case GlobalErrorType.DATABASE_ERROR:
                response.internalServerError(
                    res, 
                    message,
                    showDetails ? errors : null
                );
                break;
            
            case GlobalErrorType.FOREIGN_KEY_ERROR:
                response.badRequest(res, message, errors);
                break;
            
            default:
                // Fallback for unknown error types
                logger.error(`Unknown error type: ${errorType}`);
                response.internalServerError(
                    res,
                    'Internal server error',
                    showDetails ? errors : null
                );
                break;
        }
    }

    /**
     * Handle unexpected exceptions
     */
    static handleException(
        res: Response,
        error: unknown,
        operation: string
    ): void {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Unexpected error during ${operation} - Error: ${errorMessage}`);
        
        response.internalServerError(
            res,
            'Internal server error',
            process.env.NODE_ENV === 'development' ? errorMessage : null
        );
    }

    /**
     * Express error handling middleware
     */
    static expressErrorHandler(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        logger.error(`Express error middleware - URL: ${req.url}, Method: ${req.method}, Error: ${err.message}`);
        
        // If headers have already been sent, delegate to default error handler
        if (res.headersSent) {
            return next(err);
        }
        
        // Handle different types of errors
        if (err instanceof Error) {
            // Zod validation errors
            if (err.name === 'ZodError') {
                const zodError = err as unknown as ZodError;
                const globalError = this.handleZodError(zodError);
                return this.handleHTTPError(res, globalError);
            }
            
            // General errors
            const globalError = this.createError(
                GlobalErrorType.INTERNAL_ERROR,
                err.message,
                'INTERNAL_ERROR'
            );
            
            return this.handleHTTPError(
                res, 
                globalError,
                process.env.NODE_ENV === 'development'
            );
        }
        
        // Unknown errors
        const globalError = this.createError(
            GlobalErrorType.INTERNAL_ERROR,
            'An unexpected error occurred',
            'UNKNOWN_ERROR'
        );
        
        this.handleHTTPError(res, globalError);
    }

    /**
     * Common error responses
     */
    static readonly errors = {
        validation: (message: string, errors?: Record<string, unknown> | string | null, field?: string) => 
            this.createError(
                GlobalErrorType.VALIDATION_ERROR,
                message,
                field ? `VALIDATION_ERROR_${field.toUpperCase()}` : 'VALIDATION_ERROR',
                errors
            ),

        unauthorized: (message: string = "Unauthorized access") => 
            this.createError(
                GlobalErrorType.UNAUTHORIZED,
                message,
                'UNAUTHORIZED'
            ),

        forbidden: (message: string = "Access forbidden") => 
            this.createError(
                GlobalErrorType.FORBIDDEN,
                message,
                'FORBIDDEN'
            ),

        notFound: (resource: string = "Resource") => 
            this.createError(
                GlobalErrorType.NOT_FOUND,
                `${resource} not found`,
                'NOT_FOUND'
            ),

        conflict: (message: string) => 
            this.createError(
                GlobalErrorType.CONFLICT,
                message,
                'CONFLICT'
            ),

        internal: (message: string = "Internal server error") => 
            this.createError(
                GlobalErrorType.INTERNAL_ERROR,
                message,
                'INTERNAL_ERROR'
            )
    };
}