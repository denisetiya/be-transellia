import type { Request, Response, NextFunction } from 'express';
import env from '../config/env.config';
import logger from '../lib/lib.logger';
import response from '../lib/lib.response';


export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const apiKey = req.headers['x-api-key'] || 
                      req.headers['api-key'] || 
                      req.headers['X-API-KEY'] || 
                      req.headers['API-KEY'];

        logger.info(`API key validation attempt from IP: ${req.ip}`);

        if (!apiKey) {
            logger.warn(`API key missing from request - IP: ${req.ip}, Path: ${req.path}`);
            response.badRequest(
                res,
                'Kamu tidak memiliki akses ke endpoint ini'
            );
            return;
        }

        if (typeof apiKey !== 'string') {
            logger.warn(`Invalid API key type from request - IP: ${req.ip}, Type: ${typeof apiKey}`);
            response.badRequest(
                res,
                'Format API key tidak valid',
                [{
                    field: 'x-api-key',
                    message: 'API key harus berupa string',
                    code: 'invalid_api_key_format'
                } as Record<string, unknown>]
            );
            return;
        }

        if (apiKey !== env.API_KEY) {
            logger.warn(`Invalid API key provided - IP: ${req.ip}, Path: ${req.path}`);
            response.unauthorized(
                res,
                'API key tidak valid'
            );
            return;
        }

        logger.info(`API key validation successful - IP: ${req.ip}, Path: ${req.path}`);
        next();

    } catch (error) {
        logger.error(`API key middleware error - IP: ${req.ip}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        response.internalServerError(
            res,
            'Terjadi kesalahan sistem saat validasi API key'
        );
        return;
    }
};

export default apiKeyMiddleware;