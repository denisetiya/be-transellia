import type {Request, Response} from 'express';
import logger from '../../lib/lib.logger';
import { loginSchema, registerSchema, type iLogin } from './auth.validation';
import response from '../../lib/lib.response';
import AuthService from './auth.service';
import AuthErrorHandler from './auth.error';
import { createValidationErrorResponse } from '../../lib/lib.validation';

export default class AuthController {

    static async login(req: Request, res: Response) {
        try {
            logger.info('User login attempt');
            
            // Debug logging for request body
            logger.info(`Request body:, ${req.body}`);
            
            const data: iLogin = req.body;

            // Additional check for empty body
            if (!data || typeof data !== 'object') {
                logger.warn('Request body is empty or invalid type');
                return response.badRequest(
                    res,
                    'Request body harus berupa object JSON yang valid',
                    [{
                        field: 'root',
                        message: 'Request body tidak boleh kosong. Pastikan mengirim data dalam format JSON yang benar.',
                        code: 'missing_body'
                    }]
                );
            }

            const validation = loginSchema.safeParse(data);
            if (!validation.success) {
                logger.warn(`User login failed validation - Email: ${data?.email || 'unknown'}`);
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }

            const loginResult = await AuthService.login(data);

            if (loginResult.success) {
                logger.info(`User login successful - UserID: ${loginResult.data?.id}, Email: ${data.email}`);
                return response.success(
                    res,
                    {
                        user: loginResult.data,
                    },
                    loginResult.message,
                    {
                        token: 'token' in loginResult ? loginResult.token : null
                    }
                );
            }

            // Handle service errors using centralized handler
            AuthErrorHandler.handleControllerServiceError(res, loginResult, data.email);
            return;

        } catch (error) {
            // Handle unexpected exceptions using centralized handler
            AuthErrorHandler.handleControllerException(res, error, 'login', req.body?.email || 'unknown');
            return;
        }
    }

    static async register(req: Request, res: Response) {
        try {
            logger.info('User registration attempt');
            
            // Debug logging for request body
            logger.info(`Request body:', ${req.body}`);
            
            const data = req.body;

            // Additional check for empty body
            if (!data || typeof data !== 'object') {
                logger.warn('Request body is empty or invalid type');
                return response.badRequest(
                    res,
                    'Request body harus berupa object JSON yang valid',
                    [{
                        field: 'root',
                        message: 'Request body tidak boleh kosong. Pastikan mengirim data dalam format JSON yang benar.',
                        code: 'missing_body'
                    }]
                );
            }

            const validation = registerSchema.safeParse(data);
            if (!validation.success) {
                logger.warn(`User registration failed validation - Email: ${data?.email || 'unknown'}`);
                const validationError = createValidationErrorResponse(validation.error);
                return response.badRequest(
                    res,
                    validationError.message,
                    validationError.errors
                );
            }

            const registerResult = await AuthService.register(validation.data);

            if (registerResult.success) {
                logger.info(`User registration successful - UserID: ${registerResult.data?.id}, Email: ${data.email}`);
                return response.created(
                    res,
                    {
                        user: registerResult.data,
                    },
                    {
                        token: 'token' in registerResult ? registerResult.token : null
                    }
                );
            }

            // Handle service errors using centralized handler
            AuthErrorHandler.handleControllerServiceError(res, registerResult, data.email);
            return;

        } catch (error) {
            // Handle unexpected exceptions using centralized handler
            AuthErrorHandler.handleControllerException(res, error, 'registration', req.body?.email || 'unknown');
            return;
        }
    }

}