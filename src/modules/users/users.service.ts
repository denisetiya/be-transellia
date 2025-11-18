import prisma from '../../config/prisma.config';
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

export default class UsersService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }
    
    static async getAllUsers(page: number = 1, limit: number = 10): Promise<UsersListResult> {
        try {
            logger.info(`Attempting to fetch users from database - Page: ${page}, Limit: ${limit}`);
            
            // Check database connection
            await prisma.$connect();
            
            // Calculate skip value for pagination
            const skip = (page - 1) * limit;
            
            // Fetch users with pagination
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where: {
                        role:{ not : 'ADMIN'}
                    },
                    orderBy: {
                        createdAt: 'asc'
                    },
                    skip,
                    take: limit,
                    include: {
                        UserDetails: true,
                        subscription: true,
                    }
                }),
                prisma.user.count()
            ]);
            
            // Calculate total pages
            const totalPages = Math.ceil(total / limit);
            
            logger.info(`Successfully fetched ${users.length} users (Page: ${page}, Limit: ${limit}, Total: ${total})`);
            
            return {
                data: users.map(user => ({
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
        } finally {
            await prisma.$disconnect();
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
            
            // Check database connection
            await prisma.$connect();
            
            // Update user's subscription
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    subscriptionId: subscriptionId
                }
            });
            
            logger.info(`Successfully updated user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
            return true;
            
        } catch (error) {
            logger.error(`Failed to update user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        } finally {
            await prisma.$disconnect();
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
            
            // Check database connection
            await prisma.$connect();
            
            // Fetch user with all related information
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                include: {
                    UserDetails: true,
                    subscription: true,
                }
            });
            
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
                subscription: user.subscription,
                UserDetails: user.UserDetails,
                isEmployee: user.isEmployee,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
        } catch (error) {
            logger.error(`Failed to fetch user - User ID: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        } finally {
            await prisma.$disconnect();
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
            
            // Check database connection
            await prisma.$connect();
            
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });
            
            if (existingUser) {
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
            const result = await prisma.$transaction(async (tx) => {
                // Create user
                const newUser = await tx.user.create({
                    data: {
                        email: userData.email,
                        password: hashedPassword,
                        role: userData.role || 'user',
                        isEmployee: userData.isEmployee || false
                    }
                });
                
                // Create user details if provided
                if (userData.userDetails) {
                    await tx.userDetails.create({
                        data: {
                            userId: newUser.id,
                            name: userData.userDetails.name,
                            phoneNumber: userData.userDetails.phoneNumber || null,
                            address: userData.userDetails.address || null
                        }
                    });
                }
                
                // Return user with details
                return await tx.user.findUnique({
                    where: { id: newUser.id },
                    include: {
                        UserDetails: true,
                        subscription: true,
                    }
                });
            });
            
            if (!result) {
                logger.error(`Failed to create user - Email: ${userData.email}`);
                return {
                    data: null,
                    message: "Gagal membuat pengguna baru",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            const userResponse: iUserDetails = {
                id: result.id,
                email: result.email,
                role: result.role,
                subscriptionId: result.subscriptionId,
                subscription: result.subscription,
                UserDetails: result.UserDetails,
                isEmployee: result.isEmployee,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt
            };
            
            logger.info(`Successfully created user - ID: ${result.id}, Email: ${result.email}`);
            
            return {
                data: userResponse,
                message: "Berhasil membuat pengguna baru",
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to create user - Email: ${userData.email}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return UsersErrorHandler.handleDatabaseError(error, 'create user') as UserCreateResult;
        } finally {
            await prisma.$disconnect();
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
            
            // Check database connection
            await prisma.$connect();
            
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!existingUser) {
                logger.warn(`User not found - ID: ${userId}`);
                return {
                    data: null,
                    message: "Pengguna tidak ditemukan",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            // Check if email is already taken by another user
            if (updateData.email && updateData.email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email: updateData.email }
                });
                
                if (emailExists) {
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
            const result = await prisma.$transaction(async (tx) => {
                // Update user
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        ...(updateData.email && { email: updateData.email }),
                        ...(updateData.role !== undefined && { role: updateData.role }),
                        ...(updateData.isEmployee !== undefined && { isEmployee: updateData.isEmployee }),
                        ...(updateData.subscriptionId !== undefined && { subscriptionId: updateData.subscriptionId })
                    }
                });
                
                // Update user details if provided
                if (updateData.userDetails) {
                    // Check if user details exist
                    const existingDetails = await tx.userDetails.findUnique({
                        where: { userId }
                    });
                    
                    if (existingDetails) {
                        // Update existing details
                        await tx.userDetails.update({
                            where: { userId },
                            data: {
                                ...(updateData.userDetails.name !== undefined && { name: updateData.userDetails.name }),
                                ...(updateData.userDetails.phoneNumber !== undefined && { phoneNumber: updateData.userDetails.phoneNumber }),
                                ...(updateData.userDetails.address !== undefined && { address: updateData.userDetails.address })
                            }
                        });
                    } else {
                        // Create new details
                        await tx.userDetails.create({
                            data: {
                                userId,
                                name: updateData.userDetails.name || '',
                                phoneNumber: updateData.userDetails.phoneNumber || null,
                                address: updateData.userDetails.address || null
                            }
                        });
                    }
                }
                
                // Return updated user with details
                return await tx.user.findUnique({
                    where: { id: userId },
                    include: {
                        UserDetails: true,
                        subscription: true,
                    }
                });
            });
            
            if (!result) {
                logger.error(`Failed to update user - ID: ${userId}`);
                return {
                    data: null,
                    message: "Gagal memperbarui pengguna",
                    success: false,
                    errorType: UsersErrorType.INTERNAL_ERROR
                };
            }
            
            const userResponse: iUserDetails = {
                id: result.id,
                email: result.email,
                role: result.role,
                subscriptionId: result.subscriptionId,
                subscription: result.subscription,
                UserDetails: result.UserDetails,
                isEmployee: result.isEmployee,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt
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
        } finally {
            await prisma.$disconnect();
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
            
            // Check database connection
            await prisma.$connect();
            
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!existingUser) {
                logger.warn(`User not found - ID: ${userId}`);
                return {
                    data: null,
                    message: "Pengguna tidak ditemukan",
                    success: true
                };
            }
            
            // Delete user with transaction (will cascade delete related records)
            await prisma.$transaction(async (tx) => {
                // Delete user details if exists
                await tx.userDetails.deleteMany({
                    where: { userId }
                });
                
                // Delete user
                await tx.user.delete({
                    where: { id: userId }
                });
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
        } finally {
            await prisma.$disconnect();
        }
    }
}