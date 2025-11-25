import type { iLogin, iRegister } from "./auth.validation";
import type { iUser } from "./auth.type";
import { AuthErrorType } from "./auth.type";

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
import Hash from "../../lib/lib.hash";
import Jwt from "../../lib/lib.jwt";
import env from "../../config/env.config";
import logger from "../../lib/lib.logger";
import AuthErrorHandler from "./auth.error";
import type { AuthLoginResult, AuthRegisterResult } from "./auth.type";
import prisma from "../../config/prisma.config";
import { generateId } from "../../lib/lib.id.generator";

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
                logger.info(`Database query execution starting - Environment: ${process.env.NODE_ENV}`);
                
                // Log connection details for debugging
                logger.info(`Database URL configured: ${!!process.env.DATABASE_URL}`);
                logger.info(`Node environment: ${process.env.NODE_ENV}`);
                logger.info(`Vercel environment: ${process.env.VERCEL ? 'Yes' : 'No'}`);
                logger.info(`Vercel region: ${process.env.VERCEL_REGION || 'Unknown'}`);

                let user: UserWithDetails | null;
            
                // PRIMA-OPTIMIZED APPROACH: Use Prisma's optimized queries for serverless environments
                if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
                    logger.info(`Using Prisma-optimized query approach - Email: ${data.email}`);
                    
                    try {
                        // Step 1: Find user with Prisma
                        logger.info(`Step 1: Executing user query - Email: ${data.email}`);
                        const foundUser = await prisma.user.findUnique({
                            where: {
                                email: data.email
                            },
                            include: {
                                userDetails: true
                            }
                        });
                        
                        logger.info(`Step 1 completed - User found: ${!!foundUser}`);
                        
                        if (foundUser) {
                            user = {
                                id: foundUser.id,
                                password: foundUser.password,
                                email: foundUser.email,
                                role: foundUser.role,
                                subscriptionId: foundUser.subscriptionId,
                                isEmployee: foundUser.isEmployee,
                                userDetails: foundUser.userDetails ? {
                                    name: foundUser.userDetails.name,
                                    imageProfile: foundUser.userDetails.imageProfile,
                                    phoneNumber: foundUser.userDetails.phoneNumber,
                                    address: foundUser.userDetails.address
                                } : null
                            };
                            
                            logger.info(`Prisma query strategy completed successfully`);
                        } else {
                            user = null;
                            logger.info(`No user found with email: ${data.email}`);
                        }
                    } catch (queryError) {
                        logger.error(`Prisma query approach failed - Email: ${data.email}`);
                        logger.error(`Error type: ${queryError instanceof Error ? queryError.constructor.name : 'Unknown'}`);
                        logger.error(`Error message: ${queryError instanceof Error ? queryError.message : 'Unknown'}`);
                        throw queryError;
                    }
                } else {
                    // DEVELOPMENT APPROACH: Use Prisma with detailed logging
                    logger.info(`Using development query approach - Email: ${data.email}`);
                    
                    try {
                        logger.info(`Attempting Prisma query - Email: ${data.email}`);
                        logger.info(`Query timestamp: ${new Date().toISOString()}`);
                        
                        const foundUser = await prisma.user.findUnique({
                            where: {
                                email: data.email
                            },
                            include: {
                                userDetails: true
                            }
                        });
                        
                        if (foundUser) {
                            user = {
                                id: foundUser.id,
                                password: foundUser.password,
                                email: foundUser.email,
                                role: foundUser.role,
                                subscriptionId: foundUser.subscriptionId,
                                isEmployee: foundUser.isEmployee,
                                userDetails: foundUser.userDetails ? {
                                    name: foundUser.userDetails.name,
                                    imageProfile: foundUser.userDetails.imageProfile,
                                    phoneNumber: foundUser.userDetails.phoneNumber,
                                    address: foundUser.userDetails.address
                                } : null
                            };
                        } else {
                            user = null;
                        }
                        
                        logger.info(`Prisma query completed successfully - User found: ${!!user}`);
                    } catch (queryError) {
                        logger.error(`Prisma query failed - Email: ${data.email}`);
                        logger.error(`Error type: ${queryError instanceof Error ? queryError.constructor.name : 'Unknown'}`);
                        logger.error(`Error message: ${queryError instanceof Error ? queryError.message : 'Unknown'}`);
                        throw queryError;
                    }
                }

                if (!user) {
                    logger.warn(`User not found - Email: ${data.email}`);
                    return AuthErrorHandler.errors.invalidCredentials(data.email);
                }

                // Verify password using the same deterministic salt
                const salt = this.generateSaltFromEmail(data.email);
                logger.info(`Stored password: ${user.password}`);
                logger.info(`Generated salt: ${salt}`);
                const isPasswordValid = Hash.verifyPassword(data.password, user.password, salt);
                
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
                        subscriptionId: user.subscriptionId,
                        UserDetails: user.userDetails,
                        isEmployee: user.isEmployee
                    },
                    message: "Login berhasil",
                    token: token ? token : null,
                    success: true
                };

            } catch (error) {
                logger.error(`Login attempt ${attempt} failed - Email: ${data.email}`);
                logger.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                
                // If this is the last attempt, throw the error
                if (attempt === maxRetries) {
                    logger.error(`All ${maxRetries} login attempts failed - Email: ${data.email}`);
                    
                    // Enhanced error logging for production debugging
                    if (error instanceof Error) {
                        logger.error(`Login error details - Email: ${data.email}, Error: ${error.message}, Stack: ${error.stack}`);
                        logger.error(`Error name: ${error.name}`);
                        logger.error(`Error constructor: ${error.constructor.name}`);
                        
                        // Log additional context for debugging
                        logger.error(`Environment: ${process.env.NODE_ENV}`);
                        logger.error(`Database URL configured: ${!!process.env.DATABASE_URL}`);
                        logger.error(`Prisma logger enabled: ${process.env.NODE_ENV === 'development'}`);
                        
                        // Check for specific database connection issues
                        if (error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
                            logger.error(`Database connection issue detected - Email: ${data.email}, Error: ${error.message}`);
                            return AuthErrorHandler.createServiceError(
                                AuthErrorType.DATABASE_CONNECTION,
                                "Database connection failed. Please try again later.",
                                data.email
                            );
                        }
                        
                        // Check for query execution issues
                        if (error.message.includes('query') || error.message.includes('syntax') || error.message.includes('Failed query')) {
                            logger.error(`Database query issue detected - Email: ${data.email}, Error: ${error.message}`);
                            logger.error(`Query execution failed - This might be a Prisma query or connection issue`);
                            return AuthErrorHandler.createServiceError(
                                AuthErrorType.INTERNAL_ERROR,
                                "Database query failed. Please try again later.",
                                data.email
                            );
                        }
                        
                        // Check for Prisma specific issues
                        if (error.message.includes('Prisma') || error.message.includes('prisma')) {
                            logger.error(`Prisma ORM issue detected - Email: ${data.email}, Error: ${error.message}`);
                            logger.error(`This might be related to Prisma client or query execution`);
                            return AuthErrorHandler.createServiceError(
                                AuthErrorType.INTERNAL_ERROR,
                                "Database ORM error. Please try again later.",
                                data.email
                            );
                        }
                    } else {
                        logger.error(`Login error details - Email: ${data.email}, Error: ${JSON.stringify(error)}`);
                    }
                    
                    return AuthErrorHandler.handleDatabaseError(error, data.email, 'login');
                }
                
                // For connection-related errors, wait before retrying
                if (error instanceof Error && (
                    error.message.includes('connection') ||
                    error.message.includes('timeout') ||
                    error.message.includes('Prisma')
                )) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
                    logger.info(`Connection error detected, waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                // For non-connection errors, don't retry
                throw error;
            }
        }
        
        // This should never be reached, but TypeScript needs it
        throw new Error('Unexpected error in login method');
    }

    static async register(data: iRegister): Promise<AuthRegisterResult> {
        try {
            logger.info(`Attempting user registration - Email: ${data.email}`);

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

            // Hash password with deterministic salt based on email
            const salt = this.generateSaltFromEmail(data.email);
            const hashedPassword = Hash.hash(data.password, salt);
            
            const userId = generateId();
            const userDetailsId = generateId();

            // Create user with transaction for data consistency
            const newUser = await prisma.$transaction(async (tx) => {
                // Create user first to satisfy foreign key constraint
                const user = await tx.user.create({
                    data: {
                        id: userId,
                        email: data.email,
                        password: hashedPassword,
                        role: 'user', // Use lowercase to match schema enum
                        isEmployee: false,
                        subscriptionId: 'cmesn7has0000d5etmb7jw21s' // Default subscription
                    }
                });

                // Then create user details with valid user reference
                await tx.userDetails.create({
                    data: {
                        id: userDetailsId,
                        userId: userId,
                        name: data.name
                    }
                });

                return user;
            });

            if (!newUser) {
                throw new Error('Failed to create user');
            }

            // Generate token
            const token = this.generateToken(newUser);
            
            if (!token) {
                logger.error(`Token generation failed for user registration - UserID: ${newUser.id}, Email: ${newUser.email}`);
                // Still return success but with warning about token
                logger.warn(`User registration successful but token generation failed - UserID: ${newUser.id}`);
            } else {
                logger.info(`User registration successful - UserID: ${newUser.id}, Email: ${newUser.email}`);
            }

            // Get user details for response
            const userDetailsResult = await prisma.userDetails.findUnique({
                where: {
                    userId: newUser.id
                }
            });

            return {
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    subscriptionId: newUser.subscriptionId || null,
                    UserDetails: userDetailsResult || null,
                    isEmployee: newUser.isEmployee
                },
                message: token ? "Registrasi berhasil" : "Registrasi berhasil, namun gagal membuat token. Silakan login kembali.",
                token: token,
                success: true
            };

        } catch (error) {
            // Log detailed error information for debugging
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
            databaseUrlConfigured: !!process.env.DATABASE_URL,
            tests: []
        };

        // Add environment info
        logger.info(`=== DATABASE DIAGNOSTIC TEST START ===`);
        logger.info(`Timestamp: ${diagnosticInfo.timestamp}`);
        logger.info(`Environment: ${diagnosticInfo.environment}`);
        logger.info(`Database URL configured: ${diagnosticInfo.databaseUrlConfigured}`);
        logger.info(`Vercel environment: ${process.env.VERCEL ? 'Yes' : 'No'}`);
        logger.info(`Vercel region: ${process.env.VERCEL_REGION || 'Unknown'}`);
        logger.info(`Node.js version: ${process.version}`);

        try {
            // Test 1: Basic connection test with timing
            logger.info('Diagnostic: Testing basic database connection');
            const startTime1 = Date.now();
            await prisma.$queryRaw`SELECT version()`;
            const endTime1 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Basic Connection',
                success: true,
                result: `Connection successful in ${endTime1 - startTime1}ms`
            });
            logger.info(`Basic connection test passed in ${endTime1 - startTime1}ms`);

            // Test 2: Simple query on users table with timing
            logger.info('Diagnostic: Testing simple users table query');
            const startTime2 = Date.now();
            const userCount = await prisma.user.count();
            const endTime2 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Users Count Query',
                success: true,
                result: `Query executed successfully in ${endTime2 - startTime2}ms, found ${userCount} users`
            });
            logger.info(`Users count query passed in ${endTime2 - startTime2}ms`);

            // Test 3: Simple user query without relations (testing basic Prisma queries)
            logger.info('Diagnostic: Testing simple user query without relations');
            const startTime3 = Date.now();
            const simpleUserQuery = await prisma.user.findUnique({
                where: {
                    email: 'admin@transellia.com'
                },
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            });
            const endTime3 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Simple User Query (no relations)',
                success: true,
                result: `Simple query successful in ${endTime3 - startTime3}ms, found ${simpleUserQuery ? 1 : 0} users`
            });
            logger.info(`Simple user query passed in ${endTime3 - startTime3}ms`);

            // Test 4: The exact complex query that's used in login
            logger.info('Diagnostic: Testing the exact complex login query with relations');
            const startTime4 = Date.now();
            const testEmail = 'admin@transellia.com';
            const loginQuery = await prisma.user.findUnique({
                where: {
                    email: testEmail
                },
                include: {
                    userDetails: true
                }
            });
            const endTime4 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Complex Login Query (with relations)',
                success: true,
                result: `Complex query successful in ${endTime4 - startTime4}ms, found ${loginQuery ? 1 : 0} users`
            });
            logger.info(`Complex login query passed in ${endTime4 - startTime4}ms`);

            // Test 5: Multiple rapid queries to test connection pooling
            logger.info('Diagnostic: Testing multiple rapid queries');
            const startTime5 = Date.now();
            const promises = [];
            for (let i = 0; i < 3; i++) {
                promises.push(prisma.user.count());
            }
            await Promise.all(promises);
            const endTime5 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Multiple Rapid Queries',
                success: true,
                result: `3 parallel queries completed in ${endTime5 - startTime5}ms`
            });
            logger.info(`Multiple rapid queries passed in ${endTime5 - startTime5}ms`);

            logger.info(`=== DATABASE DIAGNOSTIC TEST COMPLETED SUCCESSFULLY ===`);
            return { success: true, details: diagnosticInfo };

        } catch (error) {
            logger.error(`=== DATABASE DIAGNOSTIC TEST FAILED ===`);
            logger.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            logger.error(`Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
            logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
            
            diagnosticInfo.tests.push({
                name: 'Error Occurred',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            
            // Analyze error patterns
            if (error instanceof Error) {
                if (error.message.includes('Prisma')) {
                    logger.error(`DIAGNOSIS: This is a Prisma ORM issue - likely query or connection problem`);
                }
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    logger.error(`DIAGNOSIS: This is a connection pooling issue - likely configuration problem`);
                }
                if (error.message.includes('query') || error.message.includes('syntax')) {
                    logger.error(`DIAGNOSIS: This is a query execution issue - possibly schema mismatch`);
                }
            }
            
            return { success: false, details: diagnosticInfo };
        }
    }
}