import type { Request } from 'express';
import type { iUser } from '../modules/auth/auth.type';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: iUser;
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user: iUser;
}

export interface MiddlewareError {
    status: number;
    message: string;
    code: string;
}

export interface ValidationErrorDetail {
    field: string;
    message: string;
    code: string;
    [key: string]: unknown;
}