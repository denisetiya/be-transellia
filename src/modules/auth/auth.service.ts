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
        try {
            logger.info(`Attempting to find user in database - Email: ${data.email}`);
            logger.info(`Database query execution starting - Environment: ${process.env.NODE_ENV}`);

            let user: UserWithDetails[];
            
            // Try the optimized query first, fallback to simpler query if it fails
            try {
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
                    
                logger.info(`Database query completed successfully - Results count: ${user.length}`);
            } catch (queryError) {
                logger.warn(`Optimized query failed, trying fallback query - Error: ${queryError instanceof Error ? queryError.message : 'Unknown'}`);
                
                // Fallback: Simple query without complex JOIN to avoid prepared statement issues
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
                    // Get user details separately
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
                
                logger.info(`Fallback query completed successfully - Results count: ${user.length}`);
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
     * Diagnostic method to test database connectivity and query execution
     */
    static async diagnosticTest(): Promise<{ success: boolean; details: DiagnosticInfo }> {
        const diagnosticInfo: DiagnosticInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            databaseUrlConfigured: !!process.env.DATABASE_URL,
            tests: []
        };

        try {
            // Test 1: Simple connection test
            logger.info('Diagnostic: Testing basic database connection');
            await db.select({ version: sql`version()` });
            diagnosticInfo.tests.push({
                name: 'Basic Connection',
                success: true,
                result: 'Connection successful'
            });

            // Test 2: Simple query on users table
            logger.info('Diagnostic: Testing simple users table query');
            await db.select({ count: sql`count(*)` }).from(users);
            diagnosticInfo.tests.push({
                name: 'Users Count Query',
                success: true,
                result: 'Query executed successfully'
            });

            // Test 3: The exact query that's failing in login
            logger.info('Diagnostic: Testing the exact login query');
            const testEmail = 'admin@arunika.com';
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

            diagnosticInfo.tests.push({
                name: 'Login Query (admin@arunika.com)',
                success: true,
                result: `Found ${loginQuery.length} users`
            });

            return { success: true, details: diagnosticInfo };

        } catch (error) {
            logger.error(`Diagnostic test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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