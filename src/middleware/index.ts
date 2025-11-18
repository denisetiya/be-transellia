export { default as apiKeyMiddleware } from './api-key.middleware';
export { default as jwtMiddleware, optionalJwtMiddleware } from './jwt.middleware';
export { default as unifiedAuthMiddleware, optionalUnifiedAuthMiddleware } from './unified-auth.middleware';

export type { AuthenticatedRequest, MiddlewareError, ValidationErrorDetail } from './middleware.types';

import apiKeyMiddleware from './api-key.middleware';
import jwtMiddleware from './jwt.middleware';
import { optionalJwtMiddleware } from './jwt.middleware';
import unifiedAuthMiddleware from './unified-auth.middleware';
import { optionalUnifiedAuthMiddleware } from './unified-auth.middleware';


export const authenticatedMiddleware = [
    apiKeyMiddleware,
    jwtMiddleware
];

export const unifiedAuthenticatedMiddleware = [
    apiKeyMiddleware,
    unifiedAuthMiddleware
];

export const apiWithOptionalAuthMiddleware = [
    apiKeyMiddleware,
    optionalJwtMiddleware
];

export const apiWithOptionalUnifiedAuthMiddleware = [
    apiKeyMiddleware,
    optionalUnifiedAuthMiddleware
];