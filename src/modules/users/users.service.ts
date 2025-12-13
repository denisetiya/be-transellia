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
import { UserRepository, type IUser } from '../../models';

export default class UsersService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }

    static async getAllUsers(page: number = 1, limit: number = 10): Promise<UsersListResult> {
        try {
            logger.info(`Fetching all users - Page: ${page}, Limit: ${limit}`);
            
            // Note: For pagination with Couchbase, we need to add findAll with pagination to UserRepository
            // For now, using a workaround with direct query
            const skip = (page - 1) * limit;
            const result = await UserRepository.findAllPaginated(skip, limit);
            
            logger.info(`Successfully fetched ${result.rows.length} users`);
            
            return {
                data: result.rows.map((user: IUser) => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId || null,
                    isEmployee: user.isEmployee,
                    userDetails: user.userDetails ? {
                        name: user.userDetails.name || undefined,
                        phoneNumber: user.userDetails.phoneNumber || undefined,
                        imageProfile: user.userDetails.imageProfile || undefined,
                        address: user.userDetails.address || undefined,
                    } : null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                })),
                message: "Berhasil mendapatkan daftar pengguna",
                success: true,
                meta: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };
            
        } catch (error) {
            return UsersErrorHandler.handleDatabaseError(error, 'fetch all users');
        }
    }

    /**
     * Update a user's subscription
     */
    static async updateUserSubscription(userId: string, subscriptionId: string): Promise<boolean> {
        try {
            logger.info(`Updating user subscription - User ID: ${userId}, Subscription ID: ${subscriptionId}`);
            
            await UserRepository.update(userId, { subscriptionId });
            
            logger.info(`Successfully updated user subscription - User ID: ${userId}`);
            return true;
            
        } catch (error) {
            logger.error(`Failed to update user subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    /**
     * Get a user by ID with all related information
     */
    static async getUserById(userId: string): Promise<iUserDetails | null> {
        try {
            logger.info(`Fetching user by ID: ${userId}`);
            
            const user = await UserRepository.findById(userId);
            
            if (!user) {
                logger.warn(`User not found - ID: ${userId}`);
                return null;
            }
            
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                subscriptionId: user.subscriptionId || null,
                isEmployee: user.isEmployee,
                userDetails: user.userDetails ? {
                    name: user.userDetails.name || undefined,
                    phoneNumber: user.userDetails.phoneNumber || undefined,
                    imageProfile: user.userDetails.imageProfile || undefined,
                    address: user.userDetails.address || undefined,
                } : null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
        } catch (error) {
            logger.error(`Failed to get user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    /**
     * Create a new user
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
            logger.info(`Creating new user - Email: ${userData.email}`);
            
            // Check if email already exists
            const existingUser = await UserRepository.findByEmail(userData.email);
            if (existingUser) {
                logger.warn(`Email already exists - Email: ${userData.email}`);
                return {
                    data: null,
                    message: "Email sudah terdaftar",
                    success: false,
                    errorType: UsersErrorType.EMAIL_ALREADY_EXISTS
                };
            }
            
            const salt = this.generateSaltFromEmail(userData.email);
            const hashedPassword = Hash.hash(userData.password, salt);
            
            const user = await UserRepository.create({
                email: userData.email,
                password: hashedPassword,
                role: (userData.role || 'user') as 'user' | 'admin',
                isEmployee: userData.isEmployee || false,
                userDetails: userData.userDetails ? {
                    name: userData.userDetails.name,
                    phoneNumber: userData.userDetails.phoneNumber,
                    address: userData.userDetails.address,
                } : undefined,
            });
            
            logger.info(`Successfully created user - ID: ${user.id}`);
            
            return {
                data: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    subscriptionId: user.subscriptionId || null,
                    isEmployee: user.isEmployee,
                    userDetails: user.userDetails ? {
                        name: user.userDetails.name || undefined,
                        phoneNumber: user.userDetails.phoneNumber || undefined,
                        address: user.userDetails.address || undefined,
                    } : null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                message: "Berhasil membuat pengguna baru",
                success: true
            };
            
        } catch (error) {
            return UsersErrorHandler.handleDatabaseError(error, 'create user');
        }
    }

    /**
     * Update a user by ID
     */
    static async updateUser(
        userId: string,
        updateData: {
            email?: string;
            password?: string;
            role?: string;
            subscriptionId?: string | null;
            userDetails?: {
                name?: string;
                phoneNumber?: string;
                address?: string;
            };
        }
    ): Promise<UserUpdateResult> {
        try {
            logger.info(`Updating user - ID: ${userId}`);
            
            const existingUser = await UserRepository.findById(userId);
            
            if (!existingUser) {
                logger.warn(`User not found for update - ID: ${userId}`);
                return {
                    data: null,
                    message: "Pengguna tidak ditemukan",
                    success: false,
                    errorType: UsersErrorType.USER_NOT_FOUND
                };
            }
            
            const dataToUpdate: Partial<IUser> = {};
            
            if (updateData.email !== undefined) {
                dataToUpdate.email = updateData.email;
            }
            if (updateData.password !== undefined) {
                const salt = this.generateSaltFromEmail(existingUser.email);
                dataToUpdate.password = Hash.hash(updateData.password, salt);
            }
            if (updateData.role !== undefined) {
                dataToUpdate.role = updateData.role as 'user' | 'admin';
            }
            if (updateData.subscriptionId !== undefined) {
                dataToUpdate.subscriptionId = updateData.subscriptionId || undefined;
            }
            if (updateData.userDetails) {
                dataToUpdate.userDetails = {
                    ...existingUser.userDetails,
                    ...updateData.userDetails,
                };
            }
            
            await UserRepository.update(userId, dataToUpdate);
            const updated = await UserRepository.findById(userId);
            
            if (!updated) {
                throw new Error('User not found after update');
            }
            
            logger.info(`Successfully updated user - ID: ${updated.id}`);
            
            return {
                data: {
                    id: updated.id,
                    email: updated.email,
                    role: updated.role,
                    subscriptionId: updated.subscriptionId || null,
                    isEmployee: updated.isEmployee,
                    userDetails: updated.userDetails ? {
                        name: updated.userDetails.name || undefined,
                        phoneNumber: updated.userDetails.phoneNumber || undefined,
                        address: updated.userDetails.address || undefined,
                    } : null,
                    createdAt: updated.createdAt,
                    updatedAt: updated.updatedAt
                },
                message: "Berhasil memperbarui pengguna",
                success: true
            };
            
        } catch (error) {
            return UsersErrorHandler.handleDatabaseError(error, `update user ID: ${userId}`);
        }
    }

    /**
     * Delete a user by ID
     */
    static async deleteUser(userId: string): Promise<UserDeleteResult> {
        try {
            logger.info(`Deleting user - ID: ${userId}`);
            
            const existingUser = await UserRepository.findById(userId);
            
            if (!existingUser) {
                logger.warn(`User not found for deletion - ID: ${userId}`);
                return {
                    data: null,
                    message: "Pengguna tidak ditemukan",
                    success: false,
                    errorType: UsersErrorType.USER_NOT_FOUND
                };
            }
            
            await UserRepository.delete(userId);
            
            logger.info(`Successfully deleted user - ID: ${userId}`);
            
            return {
                data: { id: userId },
                message: "Berhasil menghapus pengguna",
                success: true
            };
            
        } catch (error) {
            return UsersErrorHandler.handleDatabaseError(error, `delete user ID: ${userId}`);
        }
    }
}