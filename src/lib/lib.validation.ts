import { ZodError } from 'zod';

export interface ValidationErrorDetail {
    field: string;
    message: string;
    code: string;
    received?: unknown;
    expected?: string;
    [key: string]: unknown;
}

export interface FormattedValidationError {
    message: string;
    errors: ValidationErrorDetail[];
}

/**
 * Formats Zod validation errors for frontend consumption
 * @param zodError - The ZodError object from Zod validation
 * @returns Formatted error object with message (first error) and detailed errors array
 */
export function formatZodError(zodError: ZodError): FormattedValidationError {
    const errors: ValidationErrorDetail[] = zodError.issues.map(issue => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
        code: issue.code,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        received: issue.code === 'invalid_type' ? (issue as any).received : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expected: issue.code === 'invalid_type' ? (issue as any).expected : undefined,
    }));

    return {
        message: errors[0]?.message || 'Validation error occurred',
        errors
    };
}

/**
 * Creates a user-friendly validation error message
 * @param zodError - The ZodError object from Zod validation
 * @returns Formatted error with Indonesian message and detailed errors
 */
export function createValidationErrorResponse(zodError: ZodError): FormattedValidationError {
    const formattedError = formatZodError(zodError);
    
    return {
        message: formattedError.message,
        errors: formattedError.errors
    };
}