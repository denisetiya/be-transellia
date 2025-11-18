import type { Request } from 'express';
import type { iUser } from '../modules/auth/auth.type';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: iUser;
            headers: Record<string, string | string[] | undefined>;
            method: string;
        }
        interface Response {
            header: (field: string, val?: string | number | string[]) => this | string | undefined;
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