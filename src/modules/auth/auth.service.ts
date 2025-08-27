import type { iLogin, iRegister } from "./auth.validation";
import type { iUser } from "./auth.type";
import prisma from '../../config/prisma.config';
import Hash from "../../lib/lib.hash";
import Jwt from "../../lib/lib.jwt";
import env from "../../config/env.config";
import logger from "../../lib/lib.logger";
import AuthErrorHandler from "./auth.error";
import type { AuthLoginResult, AuthRegisterResult } from "./auth.type";

export default class AuthService {
    
    static salt = Hash.generateSalt();


    private static generateToken(userData: iUser)  {
        return Jwt.sign({ ...userData }, env.JWT_SECRET, { expiresIn: 86400 });
    }

    static async login(data: iLogin): Promise<AuthLoginResult> {
        try {
            logger.info(`Attempting to find user in database - Email: ${data.email}`);

            // Check database connection
            await prisma.$connect();

            const user = await prisma.user.findUnique({
                where: {
                    email: data.email
                },
                select :{
                    id: true,
                    password: true,
                    email: true,
                    role: true,
                    subscriptionId : true,
                    UserDetails : {
                        select: {
                            name: true,
                            imageProfile: true,
                            phoneNumber: true,
                            address: true
                        }
                    },
                    isEmployee: true
                }
            });

            if (!user) {
                logger.warn(`User not found - Email: ${data.email}`);
                return AuthErrorHandler.errors.invalidCredentials(data.email);
            }

            // Verify password
            const isPasswordValid = Hash.verifyPassword(data.password, user.password, this.salt);
            
            if (!isPasswordValid) {
                logger.warn(`Invalid password attempt - Email: ${data.email}, UserID: ${user.id}`);
                return AuthErrorHandler.errors.invalidCredentials(data.email);
            }


            // Generate token
            const token = this.generateToken(user);
            
            logger.info(`User login successful - UserID: ${user.id}, Email: ${user.email}`);

            return {
                data: {
                    id: user.id,
                    email: user.email,
                    password: user.password,
                    role: user.role,
                    subscriptionId : user.subscriptionId,
                    UserDetails: user.UserDetails,
                    isEmployee: user.isEmployee
                },
                message: "Login berhasil",
                token: token ? token : null,
                success: true
            };

        } catch (error) {
            return AuthErrorHandler.handleDatabaseError(error, data.email, 'login');
        } finally {
            await prisma.$disconnect();
        }
    }

    static async register(data: iRegister): Promise<AuthRegisterResult> {
        try {
            logger.info(`Attempting user registration - Email: ${data.email}`);

            // Check database connection
            await prisma.$connect();

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: data.email
                }
            });

            if (existingUser) {
                logger.warn(`Registration attempted with existing email - Email: ${data.email}`);
                return AuthErrorHandler.errors.emailAlreadyExists(data.email);
            }

            // Hash password
            const hashedPassword = Hash.hash(data.password, this.salt);
            

            // Create user with transaction for data consistency
            const newUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {                        
                        email: data.email,
                        password: hashedPassword,
                        role: 'USER',
                        isEmployee: false,
                        UserDetails: {
                            create: {
                                name: data.name
                            }
                        },
                        subscription : {
                            connect: {
                                id: 'cmesn7has0000d5etmb7jw21s'
                            }

                        }
                    },
                    include: {
                        UserDetails: true,
                    }
                });

                return user;
            });


            // Generate token
            const token = this.generateToken(newUser);
            
            logger.info(`User registration successful - UserID: ${newUser.id}, Email: ${newUser.email}`);

            return {
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    subscriptionId: newUser.subscriptionId || null,
                    UserDetails: newUser.UserDetails,
                    isEmployee: newUser.isEmployee
                },
                message: "Registrasi berhasil",
                token: token,
                success: true
            };

        } catch (error) {
            return AuthErrorHandler.handleDatabaseError(error, data.email, 'registration');
        } finally {
            await prisma.$disconnect();
        }
    }
}