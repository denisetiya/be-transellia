/**
 * Global Error Types Enum
 * Standardized error types used across the application
 */
export enum GlobalErrorType {
    // Client errors
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    
    // Server errors
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',
    TIMEOUT = 'TIMEOUT',
    FOREIGN_KEY_ERROR = 'FOREIGN_KEY_ERROR',
    
    // Service errors
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    BAD_GATEWAY = 'BAD_GATEWAY',
    GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT'
}

/**
 * Global Error Interface
 * Standardized error structure used across the application
 */
export interface GlobalError {
    data: null;
    message: string;
    success: false;
    errorType: GlobalErrorType;
    errorCode?: string;
    errors?: Record<string, unknown> | string | null;
}

/**
 * Global Error Response Interface
 * Standardized HTTP error response structure
 */
export interface GlobalErrorResponse {
    success: false;
    message: string;
    errorType: GlobalErrorType;
    errorCode?: string;
    errors?: Record<string, unknown> | string | null;
    errorDetail?: Record<string, unknown> | string | null;
    meta?: Record<string, unknown> | null;
}