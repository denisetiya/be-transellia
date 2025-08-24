import type {Request, Response} from 'express';
import logger from '../../lib/lib.logger';
import { loginSchema, type iLogin } from './auth.validation';
import response from '../../lib/lib.response';
import AuthService from './auth.service';

export default class AuthController {

    static async login(req: Request, res: Response) {
        logger.info('User login attempt');
        const data : iLogin = req.body;

        const validation = loginSchema.safeParse(data);
        if (!validation.success) {
            logger.warn('User login failed validation');
            response.badRequest(
                res,
                'Invalid login data',
                JSON.stringify(validation.error.issues)
            );
        }

        const checkUser = await AuthService.login(data);

        if (checkUser.success) {
            logger.info('User login successful');
            return response.success(
                res,
                checkUser.data
            );
        } else {
            logger.warn('User login failed');
            return response.badRequest(
                res,
                checkUser.data,
                checkUser.message
            );
        }

    }

    static async register(req: Request, res: Response) {
        logger.info('User registration attempt');
    }

}