import type { iLogin, iRegister } from "./auth.validation";
import type { iUser } from "./auth.type";
import Hash from "../../lib/lib.hash";
import Jwt from "../../lib/lib.jwt";
import env from "../../config/env.config";
import logger from "../../lib/lib.logger";
import AuthErrorHandler from "./auth.error";
import type { AuthLoginResult, AuthRegisterResult } from "./auth.type";
import { UserRepository, type IUser } from "../../models";

// Define proper types for query results
interface UserWithDetails {
    id: string;
    password: string;
    email: string;
    role: string | null;
    subscriptionId: string | null;
    isEmployee: boolean | null;
    userDetails: {
        name: string | null;
        imageProfile: string | null;
        phoneNumber: string | null;
        address: string | null;
    } | null;
}

interface DiagnosticTest {
    name: string;
    success: boolean;
    result?: string;
    error?: string;
    stack?: string;
}

interface DiagnosticInfo extends Record<string, unknown> {
    timestamp: string;
    environment: string | undefined;
    databaseUrlConfigured: boolean;
    tests: DiagnosticTest[];
}

export default class AuthService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }

    private static generateToken(userData: iUser): string | null {
        try {
            if (!env.JWT_SECRET) {
                logger.error('JWT_SECRET is not defined in environment variables');
                throw new Error('JWT_SECRET is not configured');
            }
            return Jwt.sign({ ...userData }, env.JWT_SECRET, { expiresIn: 86400 });
        } catch (error) {
            logger.error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    static async login(data: iLogin): Promise<AuthLoginResult> {
        const maxRetries = process.env.VERCEL || process.env.NODE_ENV === 'production' ? 3 : 1;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info(`Login attempt ${attempt}/${maxRetries} for email: ${data.email}`);
                
                let user: UserWithDetails | null = null;
            
                // Query user using UserRepository
                logger.info(`Using UserRepository approach - Email: ${data.email}`);
                
                const foundUser = await UserRepository.findByEmail(data.email);
                
                if (foundUser) {
                    user = {
                        id: foundUser.id,
                        password: foundUser.password,
                        email: foundUser.email,
                        role: foundUser.role,
                        subscriptionId: foundUser.subscriptionId || null,
                        isEmployee: foundUser.isEmployee,
                        userDetails: foundUser.userDetails ? {
                            name: foundUser.userDetails.name || null,
                            imageProfile: foundUser.userDetails.imageProfile || null,
                            phoneNumber: foundUser.userDetails.phoneNumber || null,
                            address: foundUser.userDetails.address || null,
                        } : null,
                    };
                    logger.info(`UserRepository query completed - User found: true`);
                } else {
                    logger.info(`UserRepository query completed - User found: false`);
                    return AuthErrorHandler.errors.userNotFound(data.email);
                }

                if (!user) {
                     return AuthErrorHandler.errors.userNotFound(data.email);
                }

                // Verify password
                const salt = this.generateSaltFromEmail(data.email);
                const hashedPassword = Hash.hash(data.password, salt);

                if (user.password !== hashedPassword) {
                    logger.warn(`Invalid password for email: ${data.email}`);
                    return AuthErrorHandler.errors.invalidPassword(data.email);
                }

                // Generate token
                const token = this.generateToken({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId,
                    isEmployee: user.isEmployee,
                    UserDetails: user.userDetails ? {
                        name: user.userDetails.name || undefined,
                        imageProfile: user.userDetails.imageProfile || undefined,
                        phoneNumber: user.userDetails.phoneNumber || undefined,
                        address: user.userDetails.address || undefined,
                    } : undefined,
                });

                if (!token) {
                    return AuthErrorHandler.errors.tokenGenerationFailed(data.email);
                }

                logger.info(`Login successful for user: ${data.email}`);

                return {
                    data: {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        role: user.role,
                        subscriptionId: user.subscriptionId,
                        UserDetails: user.userDetails ? {
                            name: user.userDetails.name || undefined,
                            imageProfile: user.userDetails.imageProfile || undefined,
                             phoneNumber: user.userDetails.phoneNumber || undefined,
                             address: user.userDetails.address || undefined,
                        } : null,
                        isEmployee: user.isEmployee
                    },
                    message: "Login berhasil",
                    token: token,
                    success: true
                };

            } catch (error) {
                // For connection-related errors, wait before retrying
                if (error instanceof Error && (
                    error.message.includes('connection') ||
                    error.message.includes('timeout')
                )) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
                    logger.info(`Connection error detected, waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                 return AuthErrorHandler.handleDatabaseError(error, data.email, 'login');
            }
        }
        
        throw new Error('Unexpected error in login method');
    }

    static async register(data: iRegister): Promise<AuthRegisterResult> {
        try {
            logger.info(`Attempting user registration - Email: ${data.email}`);

            // Check if user already exists
            const existingUser = await UserRepository.findByEmail(data.email);

            if (existingUser) {
                logger.warn(`Registration attempted with existing email - Email: ${data.email}`);
                return AuthErrorHandler.errors.emailAlreadyExists(data.email);
            }

            // Hash password with deterministic salt based on email
            const salt = this.generateSaltFromEmail(data.email);
            const hashedPassword = Hash.hash(data.password, salt);

            // Create user with UserRepository
            const newUserData: Omit<IUser, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                email: data.email,
                password: hashedPassword,
                role: 'user',
                isEmployee: false,
                userDetails: {
                    name: data.name,
                },
                subscriptionId: undefined
            };

            const createdUser = await UserRepository.create(newUserData);

            if (!createdUser) {
                throw new Error('Failed to create user');
            }

            // Generate token
            const token = this.generateToken({
                id: createdUser.id,
                email: createdUser.email,
                role: createdUser.role,
                subscriptionId: null,
                isEmployee: createdUser.isEmployee,
            });
            
            if (!token) {
                logger.error(`Token generation failed for user registration - UserID: ${createdUser.id}, Email: ${createdUser.email}`);
                logger.warn(`User registration successful but token generation failed - UserID: ${createdUser.id}`);
            } else {
                logger.info(`User registration successful - UserID: ${createdUser.id}, Email: ${createdUser.email}`);
            }

            return {
                data: {
                    id: createdUser.id,
                    email: createdUser.email,
                    password: createdUser.password,
                    role: createdUser.role,
                    subscriptionId: null,
                    UserDetails: createdUser.userDetails ? {
                        name: createdUser.userDetails.name || undefined,
                        imageProfile: createdUser.userDetails.imageProfile || undefined,
                        phoneNumber: createdUser.userDetails.phoneNumber || undefined,
                        address: createdUser.userDetails.address || undefined,
                    } : null,
                    isEmployee: createdUser.isEmployee
                },
                message: token ? "Registrasi berhasil" : "Registrasi berhasil, namun gagal membuat token. Silakan login kembali.",
                token: token,
                success: true
            };

        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Registration error details - Email: ${data.email}, Error: ${error.message}, Stack: ${error.stack}`);
            } else {
                logger.error(`Registration error details - Email: ${data.email}, Error: ${JSON.stringify(error)}`);
            }
            return AuthErrorHandler.handleDatabaseError(error, data.email, 'registration');
        }
    }

    /**
     * Enhanced diagnostic method to test database connectivity and query execution
     */
    static async diagnosticTest(): Promise<{ success: boolean; details: DiagnosticInfo }> {
        const diagnosticInfo: DiagnosticInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            databaseUrlConfigured: !!env.COUCHBASE_URL,
            tests: []
        };

        logger.info(`=== DATABASE DIAGNOSTIC TEST START ===`);
        logger.info(`Timestamp: ${diagnosticInfo.timestamp}`);
        logger.info(`Environment: ${diagnosticInfo.environment}`);
        logger.info(`Couchbase URL configured: ${diagnosticInfo.databaseUrlConfigured}`);

        try {
            // Test 1: Basic query test
            logger.info('Diagnostic: Testing basic Couchbase query');
            const startTime1 = Date.now();
            // Use findByEmail with a known admin email for testing
            await UserRepository.findByEmail('admin@transellia.com');
            const endTime1 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Basic Find Check',
                success: true,
                result: `Check executed in ${endTime1 - startTime1}ms`
            });
            // Test 2: Test admin user query
            logger.info('Diagnostic: Testing admin user query');
            const startTime2 = Date.now();
            const adminQuery = await UserRepository.findByEmail('admin@transellia.com');
            const endTime2 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Admin User Query',
                success: true,
                result: `Query successful in ${endTime2 - startTime2}ms, found ${adminQuery ? 1 : 0} admin users`
            });
            logger.info(`Admin user query passed in ${endTime2 - startTime2}ms`);

            logger.info(`=== DATABASE DIAGNOSTIC TEST COMPLETED SUCCESSFULLY ===`);
            return { success: true, details: diagnosticInfo };

        } catch (error) {
            logger.error(`=== DATABASE DIAGNOSTIC TEST FAILED ===`);
            logger.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            diagnosticInfo.tests.push({
                name: 'Error Occurred',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            
            return { success: false, details: diagnosticInfo };
        }
    }
}