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

interface SimpleUser {
    id: string;
    password: string;
    email: string;
    role: string | null;
    subscriptionId: string | null;
    isEmployee: boolean | null;
}

interface UserDetails {
    id: string;
    userId: string;
    name: string | null;
    imageProfile: string | null;
    phoneNumber: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
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
import { db } from "../../config/drizzle.config";
import { eq, sql } from "drizzle-orm";
import { users, userDetails } from "../../db/schema";
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

                let user: UserWithDetails[];
            
                // SERVERLESS-OPTIMIZED APPROACH: Skip complex JOIN entirely for serverless environments
                if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
                    logger.info(`Using serverless-optimized query approach - Email: ${data.email}`);
                    
                    try {
                        // Step 1: Simple user query without JOIN (most reliable for serverless)
                        logger.info(`Step 1: Executing simple user query - Email: ${data.email}`);
                        const simpleUser = await db.select({
                            id: users.id,
                            password: users.password,
                            email: users.email,
                            role: users.role,
                            subscriptionId: users.subscriptionId,
                            isEmployee: users.isEmployee
                        })
                            .from(users)
                            .where(eq(users.email, data.email))
                            .limit(1) as SimpleUser[];
                        
                        logger.info(`Step 1 completed - Found ${simpleUser.length} users`);
                        
                        if (simpleUser.length > 0 && simpleUser[0]) {
                            // Step 2: Separate user details query
                            logger.info(`Step 2: Executing user details query - UserID: ${simpleUser[0].id}`);
                            
                            try {
                                const userDetailsResult = await db.select()
                                    .from(userDetails)
                                    .where(eq(userDetails.userId, simpleUser[0].id))
                                    .limit(1) as UserDetails[];
                                
                                logger.info(`Step 2 completed - Found ${userDetailsResult.length} user details`);
                                
                                user = [{
                                    ...simpleUser[0],
                                    userDetails: userDetailsResult[0] || null
                                }];
                                
                                logger.info(`Serverless query strategy completed successfully - Final results count: ${user.length}`);
                            } catch (detailsError) {
                                logger.warn(`User details query failed, proceeding with user data only - Error: ${detailsError instanceof Error ? detailsError.message : 'Unknown'}`);
                                
                                user = [{
                                    ...simpleUser[0],
                                    userDetails: null
                                }];
                            }
                        } else {
                            user = [];
                            logger.info(`No user found with email: ${data.email}`);
                        }
                    } catch (queryError) {
                        logger.error(`Serverless query approach failed - Email: ${data.email}`);
                        logger.error(`Error type: ${queryError instanceof Error ? queryError.constructor.name : 'Unknown'}`);
                        logger.error(`Error message: ${queryError instanceof Error ? queryError.message : 'Unknown'}`);
                        throw queryError;
                    }
                } else {
                    // DEVELOPMENT APPROACH: Try complex JOIN first, fallback to simple queries
                    logger.info(`Using development query approach - Email: ${data.email}`);
                    
                    try {
                        logger.info(`Attempting complex JOIN query - Email: ${data.email}`);
                        logger.info(`Query timestamp: ${new Date().toISOString()}`);
                        
                        user = await db.select({
                            id: users.id,
                            password: users.password,
                            email: users.email,
                            role: users.role,
                            subscriptionId: users.subscriptionId,
                            isEmployee: users.isEmployee,
                            userDetails: {
                                name: userDetails.name,
                                imageProfile: userDetails.imageProfile,
                                phoneNumber: userDetails.phoneNumber,
                                address: userDetails.address
                            }
                        })
                            .from(users)
                            .leftJoin(userDetails, eq(users.id, userDetails.userId))
                            .where(eq(users.email, data.email))
                            .limit(1);
                            
                        logger.info(`Complex JOIN query completed successfully - Results count: ${user.length}`);
                    } catch (queryError) {
                        logger.error(`Complex JOIN query failed, falling back to simple queries - Email: ${data.email}`);
                        logger.error(`Error type: ${queryError instanceof Error ? queryError.constructor.name : 'Unknown'}`);
                        logger.error(`Error message: ${queryError instanceof Error ? queryError.message : 'Unknown'}`);
                        
                        // Fallback to simple queries
                        const simpleUser = await db.select({
                            id: users.id,
                            password: users.password,
                            email: users.email,
                            role: users.role,
                            subscriptionId: users.subscriptionId,
                            isEmployee: users.isEmployee
                        })
                            .from(users)
                            .where(eq(users.email, data.email))
                            .limit(1) as SimpleUser[];
                        
                        if (simpleUser.length > 0 && simpleUser[0]) {
                            const userDetailsResult = await db.select()
                                .from(userDetails)
                                .where(eq(userDetails.userId, simpleUser[0].id))
                                .limit(1) as UserDetails[];
                            
                            user = [{
                                ...simpleUser[0],
                                userDetails: userDetailsResult[0] || null
                            }];
                        } else {
                            user = [];
                        }
                        
                        logger.info(`Fallback query strategy completed - Final results count: ${user.length}`);
                    }
                }

                if (!user.length) {
                    logger.warn(`User not found - Email: ${data.email}`);
                    return AuthErrorHandler.errors.invalidCredentials(data.email);
                }

                const userData = user[0];
                if (!userData) {
                    logger.error(`Unexpected error: User data is null after successful query - Email: ${data.email}`);
                    return AuthErrorHandler.handleDatabaseError(new Error("User data is null"), data.email, 'login');
                }

                // Verify password using the same deterministic salt
                const salt = this.generateSaltFromEmail(data.email);
                logger.info(`Stored password: ${userData.password}`);
                logger.info(`Generated salt: ${salt}`);
                const isPasswordValid = Hash.verifyPassword(data.password, userData.password, salt);
                
                if (!isPasswordValid) {
                    logger.warn(`Invalid password attempt - Email: ${data.email}, UserID: ${userData.id}`);
                    return AuthErrorHandler.errors.invalidCredentials(data.email);
                }

                // Generate token
                const token = this.generateToken(userData);
                
                logger.info(`User login successful - UserID: ${userData.id}, Email: ${userData.email}`);

                return {
                    data: {
                        id: userData.id,
                        email: userData.email,
                        password: userData.password,
                        role: userData.role,
                        subscriptionId: userData.subscriptionId,
                        UserDetails: userData.userDetails,
                        isEmployee: userData.isEmployee
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
                        logger.error(`Drizzle logger enabled: ${process.env.NODE_ENV === 'development'}`);
                        
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
                            logger.error(`Query execution failed - This might be a prepared statement or connection pooling issue`);
                            return AuthErrorHandler.createServiceError(
                                AuthErrorType.INTERNAL_ERROR,
                                "Database query failed. Please try again later.",
                                data.email
                            );
                        }
                        
                        // Check for Drizzle ORM specific issues
                        if (error.message.includes('PostgresJsPreparedQuery') || error.message.includes('drizzle')) {
                            logger.error(`Drizzle ORM issue detected - Email: ${data.email}, Error: ${error.message}`);
                            logger.error(`This might be related to prepared statements or query caching`);
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
                    error.message.includes('PostgresJsPreparedQuery')
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
            const existingUser = await db.select().from(users)
                .where(eq(users.email, data.email))
                .limit(1);

            if (existingUser.length) {
                logger.warn(`Registration attempted with existing email - Email: ${data.email}`);
                return AuthErrorHandler.errors.emailAlreadyExists(data.email);
            }

            // Hash password with deterministic salt based on email
            const salt = this.generateSaltFromEmail(data.email);
            const hashedPassword = Hash.hash(data.password, salt);
            
            const userId = generateId();
            const userDetailsId = generateId();

            // Create user with transaction for data consistency
            const newUser = await db.transaction(async (tx) => {
                // Create user first to satisfy foreign key constraint
                const user = await tx.insert(users).values({
                    id: userId,
                    email: data.email,
                    password: hashedPassword,
                    role: 'user', // Use lowercase to match schema enum
                    isEmployee: false,
                    subscriptionId: 'cmesn7has0000d5etmb7jw21s' // Default subscription
                }).returning();

                // Then create user details with valid user reference
                await tx.insert(userDetails).values({
                    id: userDetailsId,
                    userId: userId,
                    name: data.name
                });

                return user[0];
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
            const userDetailsResult = await db.select().from(userDetails)
                .where(eq(userDetails.userId, newUser.id))
                .limit(1);

            return {
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    subscriptionId: newUser.subscriptionId || null,
                    UserDetails: userDetailsResult[0] || null,
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
            await db.select({ version: sql`version()` });
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
            const userCount = await db.select({ count: sql`count(*)` }).from(users);
            const endTime2 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Users Count Query',
                success: true,
                result: `Query executed successfully in ${endTime2 - startTime2}ms, found ${userCount[0]?.count || 0} users`
            });
            logger.info(`Users count query passed in ${endTime2 - startTime2}ms`);

            // Test 3: Simple user query without JOIN (testing prepared statement issues)
            logger.info('Diagnostic: Testing simple user query without JOIN');
            const startTime3 = Date.now();
            const simpleUserQuery = await db.select({
                id: users.id,
                email: users.email,
                role: users.role
            })
                .from(users)
                .where(eq(users.email, 'admin@transellia.com'))
                .limit(1);
            const endTime3 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Simple User Query (no JOIN)',
                success: true,
                result: `Simple query successful in ${endTime3 - startTime3}ms, found ${simpleUserQuery.length} users`
            });
            logger.info(`Simple user query passed in ${endTime3 - startTime3}ms`);

            // Test 4: The exact complex query that's failing in login
            logger.info('Diagnostic: Testing the exact complex login query with JOIN');
            const startTime4 = Date.now();
            const testEmail = 'admin@transellia.com';
            const loginQuery = await db.select({
                id: users.id,
                password: users.password,
                email: users.email,
                role: users.role,
                subscriptionId: users.subscriptionId,
                isEmployee: users.isEmployee,
                userDetails: {
                    name: userDetails.name,
                    imageProfile: userDetails.imageProfile,
                    phoneNumber: userDetails.phoneNumber,
                    address: userDetails.address
                }
            })
                .from(users)
                .leftJoin(userDetails, eq(users.id, userDetails.userId))
                .where(eq(users.email, testEmail))
                .limit(1);
            const endTime4 = Date.now();
            diagnosticInfo.tests.push({
                name: 'Complex Login Query (with JOIN)',
                success: true,
                result: `Complex query successful in ${endTime4 - startTime4}ms, found ${loginQuery.length} users`
            });
            logger.info(`Complex login query passed in ${endTime4 - startTime4}ms`);

            // Test 5: Multiple rapid queries to test connection pooling
            logger.info('Diagnostic: Testing multiple rapid queries');
            const startTime5 = Date.now();
            const promises = [];
            for (let i = 0; i < 3; i++) {
                promises.push(db.select({ count: sql`count(*)` }).from(users));
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
                if (error.message.includes('PostgresJsPreparedQuery')) {
                    logger.error(`DIAGNOSIS: This is a prepared statement issue - likely serverless compatibility problem`);
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