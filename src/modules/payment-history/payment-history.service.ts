import prisma from '../../config/prisma.config';
import logger from "../../lib/lib.logger";
import PaymentHistoryErrorHandler from "./payment-history.error";
import { PaymentHistoriesResult, PaymentHistoryResult, iPaymentHistory } from "./payment-history.type";

export default class PaymentHistoryService {
  /**
   * Get all payment histories with pagination
   */
  static async getAllPaymentHistories(page: number = 1, limit: number = 10): Promise<PaymentHistoriesResult> {
    try {
      logger.info(`Attempting to fetch payment histories from database - Page: ${page}, Limit: ${limit}`);
      
      // Check database connection
      await prisma.$connect();
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Fetch payment histories with pagination
      const [paymentHistories, total] = await Promise.all([
        prisma.paymentHistory.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                email: true,
                UserDetails: {
                  select: {
                    name: true
                  }
                }
              }
            },
            subscription: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }),
        prisma.paymentHistory.count()
      ]);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      logger.info(`Successfully fetched ${paymentHistories.length} payment histories (Page: ${page}, Limit: ${limit}, Total: ${total})`);
      
      return {
        data: paymentHistories.map(payment => ({
          id: payment.id,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          transactionTime: payment.transactionTime,
          expiryTime: payment.expiryTime,
          vaNumber: payment.vaNumber,
          bank: payment.bank,
          qrCode: payment.qrCode,
          redirectUrl: payment.redirectUrl,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        })),
        message: "Berhasil mendapatkan daftar riwayat pembayaran",
        success: true,
        meta: {
          page,
          limit,
          total,
          totalPages
        }
      };
      
    } catch (error) {
      return PaymentHistoryErrorHandler.handleDatabaseError(error, 'fetch all payment histories');
    } finally {
      await prisma.$disconnect();
    }
  }
  
  /**
   * Get payment history by ID
   */
  static async getPaymentHistoryById(id: string): Promise<PaymentHistoryResult> {
    try {
      logger.info(`Attempting to fetch payment history from database - ID: ${id}`);
      
      // Check database connection
      await prisma.$connect();
      
      const paymentHistory = await prisma.paymentHistory.findUnique({
        where: {
          id: id
        },
        include: {
          user: {
            select: {
              email: true,
              UserDetails: {
                select: {
                  name: true
                }
              }
            }
          },
          subscription: {
            select: {
              name: true,
              price: true
            }
          }
        }
      });
      
      if (!paymentHistory) {
        logger.warn(`Payment history not found - ID: ${id}`);
        return PaymentHistoryErrorHandler.errors.notFound(id);
      }
      
      logger.info(`Successfully fetched payment history - ID: ${paymentHistory.id}`);
      
      return {
        data: {
          id: paymentHistory.id,
          userId: paymentHistory.userId,
          subscriptionId: paymentHistory.subscriptionId,
          orderId: paymentHistory.orderId,
          paymentId: paymentHistory.paymentId,
          amount: paymentHistory.amount,
          currency: paymentHistory.currency,
          paymentMethod: paymentHistory.paymentMethod,
          status: paymentHistory.status,
          transactionTime: paymentHistory.transactionTime,
          expiryTime: paymentHistory.expiryTime,
          vaNumber: paymentHistory.vaNumber,
          bank: paymentHistory.bank,
          qrCode: paymentHistory.qrCode,
          redirectUrl: paymentHistory.redirectUrl,
          createdAt: paymentHistory.createdAt,
          updatedAt: paymentHistory.updatedAt
        },
        message: "Berhasil mendapatkan detail riwayat pembayaran",
        success: true
      };
      
    } catch (error) {
      return PaymentHistoryErrorHandler.handleDatabaseError(error, `fetch payment history by ID: ${id}`);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  /**
   * Get payment histories by user ID
   */
  static async getPaymentHistoriesByUserId(userId: string, page: number = 1, limit: number = 10): Promise<PaymentHistoriesResult> {
    try {
      logger.info(`Attempting to fetch payment histories for user from database - User ID: ${userId}, Page: ${page}, Limit: ${limit}`);
      
      // Check database connection
      await prisma.$connect();
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Fetch payment histories with pagination
      const [paymentHistories, total] = await Promise.all([
        prisma.paymentHistory.findMany({
          where: {
            userId: userId
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit,
          include: {
            subscription: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }),
        prisma.paymentHistory.count({
          where: {
            userId: userId
          }
        })
      ]);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      logger.info(`Successfully fetched ${paymentHistories.length} payment histories for user (User ID: ${userId}, Page: ${page}, Limit: ${limit}, Total: ${total})`);
      
      return {
        data: paymentHistories.map(payment => ({
          id: payment.id,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          transactionTime: payment.transactionTime,
          expiryTime: payment.expiryTime,
          vaNumber: payment.vaNumber,
          bank: payment.bank,
          qrCode: payment.qrCode,
          redirectUrl: payment.redirectUrl,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        })),
        message: "Berhasil mendapatkan daftar riwayat pembayaran pengguna",
        success: true,
        meta: {
          page,
          limit,
          total,
          totalPages
        }
      };
      
    } catch (error) {
      return PaymentHistoryErrorHandler.handleDatabaseError(error, `fetch payment histories by user ID: ${userId}`);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  /**
   * Create a new payment history record
   */
  static async createPaymentHistory(paymentData: Omit<iPaymentHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentHistoryResult> {
    try {
      logger.info("Attempting to create payment history in database");
      
      // Check database connection
      await prisma.$connect();
      
      const paymentHistory = await prisma.paymentHistory.create({
        data: {
          userId: paymentData.userId,
          subscriptionId: paymentData.subscriptionId,
          orderId: paymentData.orderId,
          paymentId: paymentData.paymentId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentMethod: paymentData.paymentMethod,
          status: paymentData.status,
          transactionTime: paymentData.transactionTime,
          expiryTime: paymentData.expiryTime,
          vaNumber: paymentData.vaNumber,
          bank: paymentData.bank,
          qrCode: paymentData.qrCode,
          redirectUrl: paymentData.redirectUrl
        }
      });
      
      logger.info(`Successfully created payment history - ID: ${paymentHistory.id}`);
      
      return {
        data: {
          id: paymentHistory.id,
          userId: paymentHistory.userId,
          subscriptionId: paymentHistory.subscriptionId,
          orderId: paymentHistory.orderId,
          paymentId: paymentHistory.paymentId,
          amount: paymentHistory.amount,
          currency: paymentHistory.currency,
          paymentMethod: paymentHistory.paymentMethod,
          status: paymentHistory.status,
          transactionTime: paymentHistory.transactionTime,
          expiryTime: paymentHistory.expiryTime,
          vaNumber: paymentHistory.vaNumber,
          bank: paymentHistory.bank,
          qrCode: paymentHistory.qrCode,
          redirectUrl: paymentHistory.redirectUrl,
          createdAt: paymentHistory.createdAt,
          updatedAt: paymentHistory.updatedAt
        },
        message: "Berhasil membuat riwayat pembayaran",
        success: true
      };
      
    } catch (error) {
      return PaymentHistoryErrorHandler.handleDatabaseError(error, 'create payment history');
    } finally {
      await prisma.$disconnect();
    }
  }
  
  /**
   * Update payment history status
   */
  static async updatePaymentHistoryStatus(orderId: string, status: string, paymentId?: string): Promise<PaymentHistoryResult> {
    try {
      logger.info(`Attempting to update payment history status in database - Order ID: ${orderId}, Status: ${status}`);
      
      // Check database connection
      await prisma.$connect();
      
      // Check if payment history exists
      const existingPaymentHistory = await prisma.paymentHistory.findUnique({
        where: {
          orderId: orderId
        }
      });
      
      if (!existingPaymentHistory) {
        logger.warn(`Payment history not found for update - Order ID: ${orderId}`);
        return PaymentHistoryErrorHandler.errors.notFound(orderId);
      }
      
      const paymentHistory = await prisma.paymentHistory.update({
        where: {
          orderId: orderId
        },
        data: {
          status: status,
          paymentId: paymentId
        }
      });
      
      logger.info(`Successfully updated payment history status - Order ID: ${paymentHistory.orderId}, Status: ${status}`);
      
      return {
        data: {
          id: paymentHistory.id,
          userId: paymentHistory.userId,
          subscriptionId: paymentHistory.subscriptionId,
          orderId: paymentHistory.orderId,
          paymentId: paymentHistory.paymentId,
          amount: paymentHistory.amount,
          currency: paymentHistory.currency,
          paymentMethod: paymentHistory.paymentMethod,
          status: paymentHistory.status,
          transactionTime: paymentHistory.transactionTime,
          expiryTime: paymentHistory.expiryTime,
          vaNumber: paymentHistory.vaNumber,
          bank: paymentHistory.bank,
          qrCode: paymentHistory.qrCode,
          redirectUrl: paymentHistory.redirectUrl,
          createdAt: paymentHistory.createdAt,
          updatedAt: paymentHistory.updatedAt
        },
        message: "Berhasil memperbarui status riwayat pembayaran",
        success: true
      };
      
    } catch (error) {
      return PaymentHistoryErrorHandler.handleDatabaseError(error, `update payment history status for order ID: ${orderId}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}