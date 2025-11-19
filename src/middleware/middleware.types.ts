import type { Request } from 'express';
import type { iUser } from '../modules/auth/auth.type';


declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: iUser;
            headers: Record<string, string | string[] | undefined>;
            method: string;
            ip?: string;
            path?: string;
            url?: string;
            query: Record<string, string | string[] | undefined>;
            params: Record<string, string>;
            body: unknown;
            cookies?: { [key: string]: unknown };
        }
        interface Response {
            header: (field: string, val?: string | number | string[]) => this | string | undefined;
            status: (code: number) => this;
            json: (obj?: unknown) => this;
            send: (body?: unknown) => this;
            sendStatus: (code: number) => this;
            cookie: (name: string, value: string, options?: Record<string, unknown>) => this;
            headersSent: boolean;
        }
    }
}

// Export the augmented types for explicit use
export interface AuthenticatedRequest extends Request {
    user: iUser;
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