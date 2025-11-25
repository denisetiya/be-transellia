import { db } from '../../config/drizzle.config';
import { eq, count, sql } from 'drizzle-orm';
import { users, userDetails, subscriptionLists } from '../../db/schema';
import logger from "../../lib/lib.logger";
import Hash from "../../lib/lib.hash";
import env from "../../config/env.config";
import UsersErrorHandler from "./users.error";
import {
    UsersListResult,
    iUserDetails,
    UserCreateResult,
    UserUpdateResult,
    UserDeleteResult,
    UsersErrorType
} from "./users.type";
import { generateId } from '../../lib/lib.id.generator';

export default class UsersService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }
    
    static async getAllUsers(page: number = 1, limit: number = 10): Promise<UsersListResult> {
        try {
            logger.info(`Attempting to fetch users from database - Page: ${page}, Limit: ${limit}`);
            
            // Calculate offset value for pagination
            const offset = (page - 1) * limit;
            
            // Fetch users with pagination
            const [usersData, total] = await Promise.all([
                db.select({
                    id: users.id,
                    email: users.email,
                    role: users.role,
                    subscriptionId: users.subscriptionId,
                    isEmployee: users.isEmployee,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                    UserDetails: {
                        id: userDetails.id,
                        userId: userDetails.userId,
                        name: userDetails.name,
                        imageProfile: userDetails.imageProfile,
                        phoneNumber: userDetails.phoneNumber,
                        address: userDetails.address,
                        createdAt: userDetails.createdAt,
                        updatedAt: userDetails.updatedAt
                    },
                    subscription: {
                        id: subscriptionLists.id,
                        name: subscriptionLists.name,
                        price: subscriptionLists.price,
                        currency: subscriptionLists.currency,
                        description: subscriptionLists.description,
                        durationValue: subscriptionLists.durationValue,
                        durationUnit: subscriptionLists.durationUnit,
                        features: subscriptionLists.features,
                        status: subscriptionLists.status,
                        subscribersCount: subscriptionLists.subscribersCount,
                        totalRevenue: subscriptionLists.totalRevenue,
                        createdAt: subscriptionLists.createdAt,
                        updatedAt: subscriptionLists.updatedAt
                    }
                })
                .from(users)
                .leftJoin(userDetails, eq(users.id, userDetails.userId))
                .leftJoin(subscriptionLists, eq(users.subscriptionId, subscriptionLists.id))
                .where(sql`${users.role} != 'ADMIN'`)
                .orderBy(users.createdAt)
                .limit(limit)
                .offset(offset),
                
                db.select({ count: count() }).from(users).where(sql`${users.role} != 'ADMIN'`).then(result => result[0]?.count || 0)
            ]);
            
            // Calculate total pages
            const totalPages = Math.ceil(total / limit);
            
            logger.info(`Successfully fetched ${usersData.length} users (Page: ${page}, Limit: ${limit}, Total: ${total})`);
            
            return {
                data: usersData.map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId,
                    UserDetails: user.UserDetails,
                    isEmployee: user.isEmployee,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                })),
                message: "Berhasil mendapatkan daftar pengguna",
                success: true,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
            
        } catch (error) {
            return UsersErrorHandler.handleDatabaseError(error, 'fetch all users');
        }
    }
    
    /**
     * Update a user's subscription
     * @param userId - The ID of the user to update
     * @param subscriptionId - The ID of the subscription to assign to the user
     * @returns boolean indicating success or failure
     */
    static async updateUserSubscription(userId: string, subscriptionId: string): Promise<boolean> {
        try {
            logger.info(`Attempting to update user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
            
            // Update user's subscription
            await db.update(users)
                .set({ subscriptionId })
                .where(eq(users.id, userId));
            
            logger.info(`Successfully updated user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
            return true;
            
        } catch (error) {
            logger.error(`Failed to update user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    
    /**
     * Get a user by ID with all related information
     * @param userId - The ID of the user to retrieve
     * @returns User object with all related information
     */
    static async getUserById(userId: string): Promise<iUserDetails | null> {
        try {
            logger.info(`Attempting to fetch user from database - User ID: ${userId}`);
            
            // Fetch user with all related information
            const userData = await db.select({
                id: users.id,
                email: users.email,
                role: users.role,
                subscriptionId: users.subscriptionId,
                isEmployee: users.isEmployee,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                UserDetails: {
                    id: userDetails.id,
                    userId: userDetails.userId,
                    name: userDetails.name,
                    imageProfile: userDetails.imageProfile,
                    phoneNumber: userDetails.phoneNumber,
                    address: userDetails.address,
                    createdAt: userDetails.createdAt,
                    updatedAt: userDetails.updatedAt
                },
                subscription: {
                    id: subscriptionLists.id,
                    name: subscriptionLists.name,
                    price: subscriptionLists.price,
                    currency: subscriptionLists.currency,
                    description: subscriptionLists.description,
                    durationValue: subscriptionLists.durationValue,
                    durationUnit: subscriptionLists.durationUnit,
                    features: subscriptionLists.features,
                    status: subscriptionLists.status,
                    subscribersCount: subscriptionLists.subscribersCount,
                    totalRevenue: subscriptionLists.totalRevenue,
                    createdAt: subscriptionLists.createdAt,
                    updatedAt: subscriptionLists.updatedAt
                }
            })
            .from(users)
            .leftJoin(userDetails, eq(users.id, userDetails.userId))
            .leftJoin(subscriptionLists, eq(users.subscriptionId, subscriptionLists.id))
            .where(eq(users.id, userId))
            .limit(1);
            
            if (!userData.length) {
                logger.warn(`User not found - User ID: ${userId}`);
                return null;
            }
            
            const user = userData[0];
            if (!user) {
                logger.warn(`User not found - User ID: ${userId}`);
                return null;
            }
            
            logger.info(`Successfully fetched user - User ID: ${userId}`);
            
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                subscriptionId: user.subscriptionId,
                subscription: user.subscription ? {
                    ...user.subscription,
                    price: Number(user.subscription.price),
                    totalRevenue: Number(user.subscription.totalRevenue)
                } : null,
                UserDetails: user.UserDetails,
                isEmployee: user.isEmployee,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
        } catch (error) {
            logger.error(`Failed to fetch user - User ID: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }
    
    /**
     * Create a new user
     * @param userData - The user data to create
     * @returns User object with all related information
     */
    static async createUser(userData: {
        email: string;
        password: string;
        role?: string;
        isEmployee?: boolean;
        userDetails?: {
            name: string;
            phoneNumber?: string;
            address?: string;
        };
    }): Promise<UserCreateResult> {
        try {
            logger.info(`Attempting to create new user - Email: ${userData.email}`);
            
            // Check if user already exists
            const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
            
            if (existingUser.length) {
                logger.warn(`User already exists - Email: ${userData.email}`);
                return {
                    data: null,
                    message: "Pengguna dengan email ini sudah terdaftar",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            // Hash password
            // Hash password with deterministic salt based on email
            const salt = this.generateSaltFromEmail(userData.email);
            const hashedPassword = Hash.hash(userData.password, salt);
            
            // Create user with transaction
            const result = await db.transaction(async (tx) => {
                // Create user
                const [newUser] = await tx.insert(users).values({
                    id: generateId(),
                    email: userData.email,
                    password: hashedPassword,
                    role: (userData.role || 'user') as "user" | "admin",
                    isEmployee: userData.isEmployee || false
                }).returning();
                
                // Create user details if provided
                if (userData.userDetails && newUser) {
                    await tx.insert(userDetails).values({
                        id: generateId(),
                        userId: newUser.id,
                        name: userData.userDetails.name,
                        phoneNumber: userData.userDetails.phoneNumber || null,
                        address: userData.userDetails.address || null
                    });
                }
                
                // Return user with details
                if (!newUser) {
                    return [];
                }
                
                return await db.select({
                    id: users.id,
                    email: users.email,
                    role: users.role,
                    subscriptionId: users.subscriptionId,
                    isEmployee: users.isEmployee,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                    UserDetails: {
                        id: userDetails.id,
                        userId: userDetails.userId,
                        name: userDetails.name,
                        imageProfile: userDetails.imageProfile,
                        phoneNumber: userDetails.phoneNumber,
                        address: userDetails.address,
                        createdAt: userDetails.createdAt,
                        updatedAt: userDetails.updatedAt
                    },
                    subscription: {
                        id: subscriptionLists.id,
                        name: subscriptionLists.name,
                        price: subscriptionLists.price,
                        currency: subscriptionLists.currency,
                        description: subscriptionLists.description,
                        durationValue: subscriptionLists.durationValue,
                        durationUnit: subscriptionLists.durationUnit,
                        features: subscriptionLists.features,
                        status: subscriptionLists.status,
                        subscribersCount: subscriptionLists.subscribersCount,
                        totalRevenue: subscriptionLists.totalRevenue,
                        createdAt: subscriptionLists.createdAt,
                        updatedAt: subscriptionLists.updatedAt
                    }
                })
                .from(users)
                .leftJoin(userDetails, eq(users.id, userDetails.userId))
                .leftJoin(subscriptionLists, eq(users.subscriptionId, subscriptionLists.id))
                .where(eq(users.id, newUser.id))
                .limit(1);
            });
            
            if (!result.length) {
                logger.error(`Failed to create user - Email: ${userData.email}`);
                return {
                    data: null,
                    message: "Gagal membuat pengguna baru",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            const userResult = result[0];
            if (!userResult) {
                logger.error(`Failed to create user - Email: ${userData.email}`);
                return {
                    data: null,
                    message: "Gagal membuat pengguna baru",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            const userResponse: iUserDetails = {
                id: userResult.id,
                email: userResult.email,
                role: userResult.role,
                subscriptionId: userResult.subscriptionId,
                subscription: userResult.subscription ? {
                    ...userResult.subscription,
                    price: Number(userResult.subscription.price),
                    totalRevenue: Number(userResult.subscription.totalRevenue)
                } : null,
                UserDetails: userResult.UserDetails,
                isEmployee: userResult.isEmployee,
                createdAt: userResult.createdAt,
                updatedAt: userResult.updatedAt
            };
            
            logger.info(`Successfully created user - ID: ${userResult.id}, Email: ${userResult.email}`);
            
            return {
                data: userResponse,
                message: "Berhasil membuat pengguna baru",
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to create user - Email: ${userData.email}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return UsersErrorHandler.handleDatabaseError(error, 'create user') as UserCreateResult;
        }
    }
    
    /**
     * Update a user by ID
     * @param userId - The ID of the user to update
     * @param updateData - The data to update
     * @returns Updated user object
     */
    static async updateUser(
        userId: string,
        updateData: {
            email?: string;
            role?: string;
            isEmployee?: boolean;
            subscriptionId?: string | null;
            userDetails?: {
                name?: string;
                phoneNumber?: string;
                address?: string;
            };
        }
    ): Promise<UserUpdateResult> {
        try {
            logger.info(`Attempting to update user - ID: ${userId}`);
            
            // Check if user exists
            const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            
            if (!existingUser.length) {
                logger.warn(`User not found - ID: ${userId}`);
                return {
                    data: null,
                    message: "Pengguna tidak ditemukan",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            // Check if email is already taken by another user
            if (updateData.email && existingUser[0] && updateData.email !== existingUser[0].email) {
                const emailExists = await db.select().from(users).where(eq(users.email, updateData.email)).limit(1);
                
                if (emailExists.length) {
                    logger.warn(`Email already taken - Email: ${updateData.email}`);
                    return {
                        data: null,
                        message: "Email sudah digunakan oleh pengguna lain",
                        success: false,
                        errorType: UsersErrorType.INTERNAL_ERROR
                    };
                }
            }
            
            // Update user with transaction
            const result = await db.transaction(async (tx) => {
                // Update user
                await tx.update(users).set({
                    ...(updateData.email && { email: updateData.email }),
                    ...(updateData.role !== undefined && { role: updateData.role as "user" | "admin" }),
                    ...(updateData.isEmployee !== undefined && { isEmployee: updateData.isEmployee }),
                    ...(updateData.subscriptionId !== undefined && { subscriptionId: updateData.subscriptionId })
                }).where(eq(users.id, userId));
                
                // Update user details if provided
                if (updateData.userDetails) {
                    // Check if user details exist
                    const existingDetails = await db.select().from(userDetails).where(eq(userDetails.userId, userId)).limit(1);
                    
                    if (existingDetails.length) {
                        // Update existing details
                        await tx.update(userDetails).set({
                            ...(updateData.userDetails.name !== undefined && { name: updateData.userDetails.name }),
                            ...(updateData.userDetails.phoneNumber !== undefined && { phoneNumber: updateData.userDetails.phoneNumber }),
                            ...(updateData.userDetails.address !== undefined && { address: updateData.userDetails.address })
                        }).where(eq(userDetails.userId, userId));
                    } else {
                        // Create new details
                        await tx.insert(userDetails).values({
                            id: generateId(),
                            userId,
                            name: updateData.userDetails.name || '',
                            phoneNumber: updateData.userDetails.phoneNumber || null,
                            address: updateData.userDetails.address || null
                        });
                    }
                }
                
                // Return updated user with details
                return await db.select({
                    id: users.id,
                    email: users.email,
                    role: users.role,
                    subscriptionId: users.subscriptionId,
                    isEmployee: users.isEmployee,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                    UserDetails: {
                        id: userDetails.id,
                        userId: userDetails.userId,
                        name: userDetails.name,
                        imageProfile: userDetails.imageProfile,
                        phoneNumber: userDetails.phoneNumber,
                        address: userDetails.address,
                        createdAt: userDetails.createdAt,
                        updatedAt: userDetails.updatedAt
                    },
                    subscription: {
                        id: subscriptionLists.id,
                        name: subscriptionLists.name,
                        price: subscriptionLists.price,
                        currency: subscriptionLists.currency,
                        description: subscriptionLists.description,
                        durationValue: subscriptionLists.durationValue,
                        durationUnit: subscriptionLists.durationUnit,
                        features: subscriptionLists.features,
                        status: subscriptionLists.status,
                        subscribersCount: subscriptionLists.subscribersCount,
                        totalRevenue: subscriptionLists.totalRevenue,
                        createdAt: subscriptionLists.createdAt,
                        updatedAt: subscriptionLists.updatedAt
                    }
                })
                .from(users)
                .leftJoin(userDetails, eq(users.id, userDetails.userId))
                .leftJoin(subscriptionLists, eq(users.subscriptionId, subscriptionLists.id))
                .where(eq(users.id, userId))
                .limit(1);
            });
            
            if (!result.length) {
                logger.error(`Failed to update user - ID: ${userId}`);
                return {
                    data: null,
                    message: "Gagal memperbarui pengguna",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            const userResult = result[0];
            if (!userResult) {
                logger.error(`Failed to update user - ID: ${userId}`);
                return {
                    data: null,
                    message: "Gagal memperbarui pengguna",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            const userResponse: iUserDetails = {
                id: userResult.id,
                email: userResult.email,
                role: userResult.role,
                subscriptionId: userResult.subscriptionId,
                subscription: userResult.subscription ? {
                    ...userResult.subscription,
                    price: Number(userResult.subscription.price),
                    totalRevenue: Number(userResult.subscription.totalRevenue)
                } : null,
                UserDetails: userResult.UserDetails,
                isEmployee: userResult.isEmployee,
                createdAt: userResult.createdAt,
                updatedAt: userResult.updatedAt
            };
            
            logger.info(`Successfully updated user - ID: ${userId}`);
            
            return {
                data: userResponse,
                message: "Berhasil memperbarui pengguna",
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to update user - ID: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return UsersErrorHandler.handleDatabaseError(error, 'update user') as UserUpdateResult;
        }
    }
    
    /**
     * Delete a user by ID
     * @param userId - The ID of the user to delete
     * @returns Success status
     */
    static async deleteUser(userId: string): Promise<UserDeleteResult> {
        try {
            logger.info(`Attempting to delete user - ID: ${userId}`);
            
            // Check if user exists
            const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            
            if (!existingUser.length) {
                logger.warn(`User not found - ID: ${userId}`);
                return {
                    data: null,
                    message: "Pengguna tidak ditemukan",
                    success: true
                };
            }
            
            // Delete user with transaction (will cascade delete related records)
            await db.transaction(async (tx) => {
                // Delete user details if exists
                await tx.delete(userDetails).where(eq(userDetails.userId, userId));
                
                // Delete user
                await tx.delete(users).where(eq(users.id, userId));
            });
            
            logger.info(`Successfully deleted user - ID: ${userId}`);
            
            return {
                data: null,
                message: "Berhasil menghapus pengguna",
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to delete user - ID: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return UsersErrorHandler.handleDatabaseError(error, 'delete user') as UserDeleteResult;
        }
    }
}