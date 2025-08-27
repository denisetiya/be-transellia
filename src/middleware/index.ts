export { default as apiKeyMiddleware } from './api-key.middleware';
export { default as jwtMiddleware, optionalJwtMiddleware } from './jwt.middleware';

export type { AuthenticatedRequest, MiddlewareError, ValidationErrorDetail } from './middleware.types';

import apiKeyMiddleware from './api-key.middleware';
import jwtMiddleware from './jwt.middleware';
import { optionalJwtMiddleware } from './jwt.middleware';


export const authenticatedMiddleware = [
    apiKeyMiddleware,
    jwtMiddleware
];


export const apiWithOptionalAuthMiddleware = [
    apiKeyMiddleware,
    optionalJwtMiddleware
];