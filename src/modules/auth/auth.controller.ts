import type {Request, Response} from 'express';
import logger from '../../lib/lib.logger';
import { loginSchema, registerSchema, type iLogin } from './auth.validation';
import response from '../../lib/lib.response';
import AuthService from './auth.service';
import AuthErrorHandler from './auth.error';

export default class AuthController {

    static async login(req: Request, res: Response) {
        try {
            logger.info('User login attempt');
            const data: iLogin = req.body;

            const validation = loginSchema.safeParse(data);
            if (!validation.success) {
                logger.warn(`User login failed validation - Email: ${data?.email || 'unknown'}`);
                return response.badRequest(
                    res,
                    'Data login tidak valid',
                    validation.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                );
            }

            const loginResult = await AuthService.login(data);

            if (loginResult.success) {
                logger.info(`User login successful - UserID: ${loginResult.data?.id}, Email: ${data.email}`);
                return response.success(
                    res,
                    {
                        user: loginResult.data,
                        token: 'token' in loginResult ? loginResult.token : null
                    },
                    loginResult.message
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
            const data = req.body;

            const validation = registerSchema.safeParse(data);
            if (!validation.success) {
                logger.warn(`User registration failed validation - Email: ${data?.email || 'unknown'}`);
                return response.badRequest(
                    res,
                    'Data registrasi tidak valid',
                    validation.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                );
            }

            const registerResult = await AuthService.register(validation.data);

            if (registerResult.success) {
                logger.info(`User registration successful - UserID: ${registerResult.data?.id}, Email: ${data.email}`);
                return response.created(
                    res,
                    {
                        user: registerResult.data,
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