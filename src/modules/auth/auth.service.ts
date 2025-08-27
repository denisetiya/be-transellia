import type { iLogin, iUser, iRegister } from "./auth.validation";
import prisma from '../../config/prisma.config';
import Hash from "../../lib/lib.hash";
import Jwt from "../../lib/lib.jwt";
import env from "../../config/env.config";
import logger from "../../lib/lib.logger";
import { generateId } from "../../lib/lib.id.generator";

export default class AuthService {
    
    static salt =  Hash.generateSalt()


    private static handleError(error: unknown, email: string, operation: 'login' | 'registration') {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Database error during ${operation} - Error: ${errorMessage}, Email: ${email}`);

        if (error instanceof Error) {
            // Handle unique constraint error (for registration)
            if (error.message.includes('Unique constraint')) {
                return {
                    data: null,
                    message: "Email sudah terdaftar. Silakan gunakan email lain.",
                    success: false,
                    errorType: 'CONFLICT'
                };
            }
            
            // Handle connection errors
            if (error.message.includes('connection')) {
                return {
                    data: null,
                    message: "Koneksi database bermasalah. Silakan coba lagi.",
                    success: false,
                    errorType: 'DATABASE_CONNECTION'
                };
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                return {
                    data: null,
                    message: "Request timeout. Silakan coba lagi.",
                    success: false,
                    errorType: 'TIMEOUT'
                };
            }

            // Handle foreign key constraint errors (for registration)
            if (error.message.includes('Foreign key constraint')) {
                return {
                    data: null,
                    message: "Data referensi tidak valid. Silakan coba lagi.",
                    success: false,
                    errorType: 'FOREIGN_KEY_ERROR'
                };
            }
        }

        // Default error response
        return {
            data: null,
            message: "Terjadi kesalahan sistem. Silakan coba lagi.",
            success: false,
            errorType: 'INTERNAL_ERROR'
        };
    }


    private static generateToken(userData: iUser)  {
        return Jwt.sign({ ...userData }, env.JWT_SECRET, { expiresIn: 86400 });
    }

    static async login(data: iLogin) {
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
                    subscriptionType: true,
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
                return {
                    data: null,
                    message: "Email atau password salah. Silakan coba lagi.",
                    success: false,
                    errorType: 'INVALID_CREDENTIALS'
                };
            }

            // Verify password
            const isPasswordValid = Hash.verifyPassword(data.password, user.password, this.salt);
            
            if (!isPasswordValid) {
                logger.warn(`Invalid password attempt - Email: ${data.email}, UserID: ${user.id}`);
                return {
                    data: null,
                    message: "Email atau password salah. Silakan coba lagi.",
                    success: false,
                    errorType: 'INVALID_CREDENTIALS'
                };
            }

            // Generate token
            const token = this.generateToken(user);
            
            logger.info(`User login successful - UserID: ${user.id}, Email: ${user.email}`);

            return {
                data: user,
                message: "Login berhasil",
                token: token ? token : null,
                success: true
            };

        } catch (error) {
            return this.handleError(error, data.email, 'login');
        } finally {
            await prisma.$disconnect();
        }
    }

    static async register(data: iRegister) {
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
                return {
                    data: null,
                    message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
                    success: false,
                    errorType: 'CONFLICT'
                };
            }

            // Hash password
            const hashedPassword = Hash.hash(data.password, this.salt);
            
            // Generate user ID
            const userId = generateId();

            // Create user with transaction for data consistency
            const newUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        id: userId,
                        email: data.email,
                        password: hashedPassword,
                        role: 'USER',
                        subscriptionType: 'FREE',
                        isEmployee: false,
                        UserDetails: {
                            create: {
                                name: data.name
                            }
                        }
                    },
                    include: {
                        UserDetails: true
                    }
                });

                return user;
            });

            // Generate token
            const token = this.generateToken(newUser);
            
            logger.info(`User registration successful - UserID: ${newUser.id}, Email: ${newUser.email}`);

            return {
                data: newUser,
                message: "Registrasi berhasil",
                token: token,
                success: true
            };

        } catch (error) {
            return this.handleError(error, data.email, 'registration');
        } finally {
            await prisma.$disconnect();
        }
    }
}