import prisma from '../../config/prisma.config';
import logger from "../../lib/lib.logger";
import PaymentHistoryErrorHandler from "./payment-history.error";
import { PaymentHistoriesResult, PaymentHistoryResult, iPaymentHistory } from "./payment-history.type";
import { generateId } from '../../lib/lib.id.generator';

export default class PaymentHistoryService {
  /**
   * Get all payment histories with pagination
   */
  static async getAllPaymentHistories(page: number = 1, limit: number = 10): Promise<PaymentHistoriesResult> {
    try {
      logger.info(`Attempting to fetch payment histories from database - Page: ${page}, Limit: ${limit}`);
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Fetch payment histories with pagination using Prisma
      const [paymentHistoriesData, total] = await Promise.all([
        prisma.paymentHistory.findMany({
          include: {
            user: {
              select: {
                email: true
              }
            },
            subscription: {
              select: {
                name: true,
                price: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        
        prisma.paymentHistory.count()
      ]);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      logger.info(`Successfully fetched ${paymentHistoriesData.length} payment histories (Page: ${page}, Limit: ${limit}, Total: ${total})`);
      
      return {
        data: paymentHistoriesData.map(payment => ({
          id: payment.id,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          amount: Number(payment.amount),
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
    }
  }
  
  /**
   * Get payment history by ID
   */
  static async getPaymentHistoryById(id: string): Promise<PaymentHistoryResult> {
    try {
      logger.info(`Attempting to fetch payment history from database - ID: ${id}`);
      
      const paymentHistoryData = await prisma.paymentHistory.findUnique({
        where: {
          id: id
        },
        include: {
          user: {
            select: {
              email: true
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
      
      if (!paymentHistoryData) {
        logger.warn(`Payment history not found - ID: ${id}`);
        return PaymentHistoryErrorHandler.errors.notFound(id);
      }
      
      const paymentHistory = paymentHistoryData;
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
          amount: Number(paymentHistory.amount),
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
    }
  }
  
  /**
   * Get payment histories by user ID
   */
  static async getPaymentHistoriesByUserId(userId: string, page: number = 1, limit: number = 10): Promise<PaymentHistoriesResult> {
    try {
      logger.info(`Attempting to fetch payment histories for user from database - User ID: ${userId}, Page: ${page}, Limit: ${limit}`);
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Fetch payment histories with pagination using Prisma
      const [paymentHistoriesData, total] = await Promise.all([
        prisma.paymentHistory.findMany({
          where: {
            userId: userId
          },
          include: {
            subscription: {
              select: {
                name: true,
                price: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        
        prisma.paymentHistory.count({
          where: {
            userId: userId
          }
        })
      ]);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      logger.info(`Successfully fetched ${paymentHistoriesData.length} payment histories for user (User ID: ${userId}, Page: ${page}, Limit: ${limit}, Total: ${total})`);
      
      return {
        data: paymentHistoriesData.map(payment => ({
          id: payment.id,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          amount: Number(payment.amount),
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
    }
  }
  
  /**
   * Create a new payment history record
   */
  static async createPaymentHistory(paymentData: Omit<iPaymentHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentHistoryResult> {
    try {
      logger.info("Attempting to create payment history in database");
      
      const paymentHistory = await prisma.paymentHistory.create({
        data: {
          id: generateId(),
          userId: paymentData.userId,
          subscriptionId: paymentData.subscriptionId,
          orderId: paymentData.orderId,
          paymentId: paymentData.paymentId,
          amount: paymentData.amount.toString(),
          currency: paymentData.currency,
          paymentMethod: paymentData.paymentMethod as "va" | "qr" | "wallet" | "credit_card",
          status: paymentData.status as "pending" | "success" | "failed" | "expired",
          transactionTime: paymentData.transactionTime,
          expiryTime: paymentData.expiryTime,
          vaNumber: paymentData.vaNumber,
          bank: paymentData.bank,
          qrCode: paymentData.qrCode,
          redirectUrl: paymentData.redirectUrl
        }
      });
      
      if (!paymentHistory) {
        logger.error("Failed to create payment history");
        return PaymentHistoryErrorHandler.handleDatabaseError(new Error("Failed to create payment history"), 'create payment history');
      }
      
      logger.info(`Successfully created payment history - ID: ${paymentHistory.id}`);
      
      return {
        data: {
          id: paymentHistory.id,
          userId: paymentHistory.userId,
          subscriptionId: paymentHistory.subscriptionId,
          orderId: paymentHistory.orderId,
          paymentId: paymentHistory.paymentId,
          amount: Number(paymentHistory.amount),
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
    }
  }
  
  /**
   * Update payment history status
   */
  static async updatePaymentHistoryStatus(orderId: string, status: string, paymentId?: string): Promise<PaymentHistoryResult> {
    try {
      logger.info(`Attempting to update payment history status in database - Order ID: ${orderId}, Status: ${status}`);
      
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
          status: status as "pending" | "success" | "failed" | "expired",
          paymentId: paymentId
        }
      });
      
      if (!paymentHistory) {
        logger.error(`Failed to update payment history status - Order ID: ${orderId}`);
        return PaymentHistoryErrorHandler.handleDatabaseError(new Error("Failed to update payment history"), `update payment history status for order ID: ${orderId}`);
      }
      
      logger.info(`Successfully updated payment history status - Order ID: ${paymentHistory.orderId}, Status: ${status}`);
      
      return {
        data: {
          id: paymentHistory.id,
          userId: paymentHistory.userId,
          subscriptionId: paymentHistory.subscriptionId,
          orderId: paymentHistory.orderId,
          paymentId: paymentHistory.paymentId,
          amount: Number(paymentHistory.amount),
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
    }
  }
}