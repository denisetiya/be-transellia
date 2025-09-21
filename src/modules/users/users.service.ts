import prisma from '../../config/prisma.config';
import logger from "../../lib/lib.logger";
import UsersErrorHandler from "./users.error";
import { UsersListResult } from "./users.type";

export default class UsersService {
    
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
                    orderBy: {
                        createdAt: 'asc'
                    },
                    skip,
                    take: limit,
                    include: {
                        UserDetails: true
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
}