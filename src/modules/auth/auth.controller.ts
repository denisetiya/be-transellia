import type {Request, Response} from 'express';
import logger from '../../lib/lib.logger';
import { loginSchema, registerSchema, type iLogin } from './auth.validation';
import response from '../../lib/lib.response';
import AuthService from './auth.service';

export default class AuthController {

    static async login(req: Request, res: Response) {
        try {
            logger.info('User login attempt');
            const data: iLogin = req.body;

            // Validate input data
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

            // Attempt login
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
            } else {
                logger.warn(`User login failed - Email: ${data.email}, Reason: ${loginResult.message}`);
                return response.unauthorized(
                    res,
                    loginResult.message
                );
            }

        } catch (error) {
            logger.error(`Unexpected error during login - Error: ${error instanceof Error ? error.message : 'Unknown error'}, Email: ${req.body?.email || 'unknown'}`);
            return response.internalServerError(
                res,
                'Terjadi kesalahan sistem. Silakan coba lagi.',
                process.env.NODE_ENV === 'development' ? 
                    (error instanceof Error ? error.message : 'Unknown error') : null
            );
        }
    }

    static async register(req: Request, res: Response) {
        try {
            logger.info('User registration attempt');
            const data = req.body;

            // Validate input data
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

            // Attempt registration
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
            } else {
                logger.warn(`User registration failed - Email: ${data.email}, Reason: ${registerResult.message}`);
                
                // Handle specific error types
                if ((registerResult as any).errorType === 'CONFLICT') {
                    return response.conflict(
                        res,
                        registerResult.message
                    );
                } else {
                    return response.badRequest(
                        res,
                        registerResult.message
                    );
                }
            }

        } catch (error) {
            logger.error(`Unexpected error during registration - Error: ${error instanceof Error ? error.message : 'Unknown error'}, Email: ${req.body?.email || 'unknown'}`);
            return response.internalServerError(
                res,
                'Terjadi kesalahan sistem. Silakan coba lagi.',
                process.env.NODE_ENV === 'development' ? 
                    (error instanceof Error ? error.message : 'Unknown error') : null
            );
        }
    }

}