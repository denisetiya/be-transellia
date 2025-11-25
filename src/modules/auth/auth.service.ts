import type { iLogin, iRegister } from "./auth.validation";
import type { iUser } from "./auth.type";
import Hash from "../../lib/lib.hash";
import Jwt from "../../lib/lib.jwt";
import env from "../../config/env.config";
import logger from "../../lib/lib.logger";
import AuthErrorHandler from "./auth.error";
import type { AuthLoginResult, AuthRegisterResult } from "./auth.type";
import { db } from "../../config/drizzle.config";
import { eq } from "drizzle-orm";
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

            const user = await db.select({
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
                // Create user details first
                await tx.insert(userDetails).values({
                    id: userDetailsId,
                    userId: userId,
                    name: data.name
                });

                // Then create user
                const user = await tx.insert(users).values({
                    id: userId,
                    email: data.email,
                    password: hashedPassword,
                    role: 'user', // Use lowercase to match schema enum
                    isEmployee: false,
                    subscriptionId: 'cmesn7has0000d5etmb7jw21s' // Default subscription
                }).returning();

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
            return AuthErrorHandler.handleDatabaseError(error, data.email, 'registration');
        }
    }
}