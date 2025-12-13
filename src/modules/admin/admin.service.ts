import logger from '../../lib/lib.logger';
import Hash from '../../lib/lib.hash';
import env from '../../config/env.config';
import { UserRepository } from '../../models';

export default class AdminService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }

    /**
     * Initialize admin user from environment variables
     * This function should be called during application startup
     */
    static async initializeAdmin(): Promise<{ success: boolean; message: string; adminCreated?: boolean }> {
        try {
            // Check if admin environment variables are configured
            const adminEmail = env.ADMIN_EMAIL;
            const adminPassword = env.ADMIN_PASSWORD;
            const adminName = env.ADMIN_NAME || 'Administrator';

            if (!adminEmail || !adminPassword) {
                logger.info('Admin environment variables not configured, skipping admin initialization');
                return {
                    success: true,
                    message: 'Admin environment variables not configured, skipping initialization',
                    adminCreated: false
                };
            }

            logger.info(`Checking if admin user exists - Email: ${adminEmail}`);

            // Check if admin user already exists using UserRepository
            const existingAdmin = await UserRepository.findByEmail(adminEmail);

            if (existingAdmin && existingAdmin.role === 'admin') {
                logger.info(`Admin user already exists - Email: ${adminEmail}, ID: ${existingAdmin.id}`);
                return {
                    success: true,
                    message: 'Admin user already exists',
                    adminCreated: false
                };
            }

            if (existingAdmin) {
                // Update existing user to admin role
                await UserRepository.update(existingAdmin.id, {
                    role: 'admin',
                    isEmployee: false
                });
                logger.info(`Updated existing user to admin role - Email: ${adminEmail}, ID: ${existingAdmin.id}`);
                
                return {
                    success: true,
                    message: 'Admin user updated successfully',
                    adminCreated: false
                };
            } else {
                // Create new admin user
                const salt = this.generateSaltFromEmail(adminEmail);
                const hashedPassword = Hash.hash(adminPassword, salt);

                const newAdmin = await UserRepository.create({
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'admin',
                    isEmployee: false,
                    userDetails: {
                        name: adminName,
                    },
                });
                
                logger.info(`Created new admin user - Email: ${adminEmail}, ID: ${newAdmin.id}`);

                return {
                    success: true,
                    message: 'Admin user created successfully',
                    adminCreated: true
                };
            }

        } catch (error) {
            logger.error(`Failed to initialize admin user - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                message: `Failed to initialize admin user: ${error instanceof Error ? error.message : 'Unknown error'}`,
                adminCreated: false
            };
        }
    }

    /**
     * Get admin user information
     */
    static async getAdminUser(): Promise<{ id: string; email: string; name: string | null } | null> {
        try {
            const adminEmail = env.ADMIN_EMAIL;
            
            if (!adminEmail) {
                logger.warn('ADMIN_EMAIL not configured');
                return null;
            }

            // Using findByEmail since it's unique
            const admin = await UserRepository.findByEmail(adminEmail);
            
            if (!admin || admin.role !== 'admin') {
                logger.warn(`Admin user not found - Email: ${adminEmail}`);
                return null;
            }

            return {
                id: admin.id,
                email: admin.email,
                name: admin.userDetails?.name || null
            };

        } catch (error) {
            logger.error(`Failed to get admin user - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    /**
     * Reset admin password
     */
    static async resetAdminPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const adminEmail = env.ADMIN_EMAIL;
            
            if (!adminEmail) {
                return {
                    success: false,
                    message: 'ADMIN_EMAIL not configured'
                };
            }

            const admin = await UserRepository.findByEmail(adminEmail);

            if (!admin || admin.role !== 'admin') {
                return {
                    success: false,
                    message: 'Admin user not found'
                };
            }

            const salt = this.generateSaltFromEmail(adminEmail);
            const hashedPassword = Hash.hash(newPassword, salt);

            await UserRepository.update(admin.id, { password: hashedPassword });

            logger.info(`Admin password reset successfully - Email: ${adminEmail}`);
            
            return {
                success: true,
                message: 'Admin password reset successfully'
            };

        } catch (error) {
            logger.error(`Failed to reset admin password - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                message: `Failed to reset admin password: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}