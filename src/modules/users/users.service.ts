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
import { generateId } from '../../lib/lib.id.generator';

export default class UsersService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }
    
    static async getAllUsers(page: number = 1, limit: number = 10): Promise<UsersListResult> {
        try {
            logger.info(`Attempting to fetch users from database - Page: ${page}, Limit: ${limit}`);
            
            // Calculate skip value for pagination
            const skip = (page - 1) * limit;
            
            // Fetch users with pagination using Prisma
            const [usersData, total] = await Promise.all([
                prisma.user.findMany({
                    where: {
                        role: {
                            not: 'admin'
                        }
                    },
                    include: {
                        userDetails: true,
                        subscription: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    },
                    skip,
                    take: limit
                }),
                
                prisma.user.count({
                    where: {
                        role: {
                            not: 'admin'
                        }
                    }
                })
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
                    UserDetails: user.userDetails ? {
                        name: user.userDetails.name,
                        imageProfile: user.userDetails.imageProfile,
                        phoneNumber: user.userDetails.phoneNumber,
                        address: user.userDetails.address
                    } : null,
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
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    subscriptionId
                }
            });
            
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
            
            // Fetch user with all related information using Prisma
            const userData = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                include: {
                    userDetails: true,
                    subscription: true
                }
            });
            
            if (!userData) {
                logger.warn(`User not found - User ID: ${userId}`);
                return null;
            }
            
            logger.info(`Successfully fetched user - User ID: ${userId}`);
            
            return {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                subscriptionId: userData.subscriptionId,
                subscription: userData.subscription ? {
                    id: userData.subscription.id,
                    name: userData.subscription.name,
                    price: Number(userData.subscription.price),
                    currency: userData.subscription.currency,
                    description: userData.subscription.description,
                    durationValue: userData.subscription.durationValue,
                    durationUnit: userData.subscription.durationUnit,
                    features: userData.subscription.features,
                    status: userData.subscription.status,
                    subscribersCount: userData.subscription.subscribersCount,
                    totalRevenue: Number(userData.subscription.totalRevenue),
                    createdAt: userData.subscription.createdAt,
                    updatedAt: userData.subscription.updatedAt
                } : null,
                UserDetails: userData.userDetails ? {
                    name: userData.userDetails.name,
                    imageProfile: userData.userDetails.imageProfile,
                    phoneNumber: userData.userDetails.phoneNumber,
                    address: userData.userDetails.address
                } : null,
                isEmployee: userData.isEmployee,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
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
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: userData.email
                }
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
                        id: generateId(),
                        email: userData.email,
                        password: hashedPassword,
                        role: (userData.role || 'user') as "user" | "admin",
                        isEmployee: userData.isEmployee || false
                    },
                    include: {
                        userDetails: true,
                        subscription: true
                    }
                });
                
                // Create user details if provided
                if (userData.userDetails && newUser) {
                    await tx.userDetails.create({
                        data: {
                            id: generateId(),
                            userId: newUser.id,
                            name: userData.userDetails.name,
                            phoneNumber: userData.userDetails.phoneNumber || null,
                            address: userData.userDetails.address || null
                        }
                    });
                    
                    // Refetch to include userDetails
                    return await tx.user.findUnique({
                        where: {
                            id: newUser.id
                        },
                        include: {
                            userDetails: true,
                            subscription: true
                        }
                    });
                }
                
                return newUser;
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
                subscription: result.subscription ? {
                    id: result.subscription.id,
                    name: result.subscription.name,
                    price: Number(result.subscription.price),
                    currency: result.subscription.currency,
                    description: result.subscription.description,
                    durationValue: result.subscription.durationValue,
                    durationUnit: result.subscription.durationUnit,
                    features: result.subscription.features,
                    status: result.subscription.status,
                    subscribersCount: result.subscription.subscribersCount,
                    totalRevenue: Number(result.subscription.totalRevenue),
                    createdAt: result.subscription.createdAt,
                    updatedAt: result.subscription.updatedAt
                } : null,
                UserDetails: result.userDetails ? {
                    name: result.userDetails.name,
                    imageProfile: result.userDetails.imageProfile,
                    phoneNumber: result.userDetails.phoneNumber,
                    address: result.userDetails.address
                } : null,
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
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId
                }
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
                    where: {
                        email: updateData.email
                    }
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
                    where: {
                        id: userId
                    },
                    data: {
                        ...(updateData.email && { email: updateData.email }),
                        ...(updateData.role !== undefined && { role: updateData.role as "user" | "admin" }),
                        ...(updateData.isEmployee !== undefined && { isEmployee: updateData.isEmployee }),
                        ...(updateData.subscriptionId !== undefined && { subscriptionId: updateData.subscriptionId })
                    }
                });
                
                // Update user details if provided
                if (updateData.userDetails) {
                    // Check if user details exist
                    const existingDetails = await tx.userDetails.findUnique({
                        where: {
                            userId: userId
                        }
                    });
                    
                    if (existingDetails) {
                        // Update existing details
                        await tx.userDetails.update({
                            where: {
                                userId: userId
                            },
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
                                id: generateId(),
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
                    where: {
                        id: userId
                    },
                    include: {
                        userDetails: true,
                        subscription: true
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
                subscription: result.subscription ? {
                    id: result.subscription.id,
                    name: result.subscription.name,
                    price: Number(result.subscription.price),
                    currency: result.subscription.currency,
                    description: result.subscription.description,
                    durationValue: result.subscription.durationValue,
                    durationUnit: result.subscription.durationUnit,
                    features: result.subscription.features,
                    status: result.subscription.status,
                    subscribersCount: result.subscription.subscribersCount,
                    totalRevenue: Number(result.subscription.totalRevenue),
                    createdAt: result.subscription.createdAt,
                    updatedAt: result.subscription.updatedAt
                } : null,
                UserDetails: result.userDetails ? {
                    name: result.userDetails.name,
                    imageProfile: result.userDetails.imageProfile,
                    phoneNumber: result.userDetails.phoneNumber,
                    address: result.userDetails.address
                } : null,
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
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: userId
                }
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
                    where: {
                        userId: userId
                    }
                });
                
                // Delete user (will cascade delete related records)
                await tx.user.delete({
                    where: {
                        id: userId
                    }
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
        }
    }
}