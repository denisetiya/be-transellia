import logger from "../../lib/lib.logger";
import PaymentHistoryErrorHandler from "./payment-history.error";
import { PaymentHistoriesResult, PaymentHistoryResult, iPaymentHistory } from "./payment-history.type";
import { generateId } from '../../lib/lib.id.generator';
import { PaymentHistoryRepository, type IPaymentHistory } from '../../models';

export default class PaymentHistoryService {
  /**
   * Get all payment histories with pagination
   */
  static async getAllPaymentHistories(page: number = 1, limit: number = 10): Promise<PaymentHistoriesResult> {
    try {
      logger.info(`Attempting to fetch payment histories from database - Page: ${page}, Limit: ${limit}`);
      
      const skip = (page - 1) * limit;
      
      const result = await PaymentHistoryRepository.findAll(skip, limit);
      
      const total = result.total;
      const totalPages = Math.ceil(total / limit);
      
      const paymentHistoriesData = result.rows as (IPaymentHistory & { id: string })[]; // ID is already in IPaymentHistory
      
      logger.info(`Successfully fetched ${paymentHistoriesData.length} payment histories (Page: ${page}, Limit: ${limit}, Total: ${total})`);
      
      return {
        data: paymentHistoriesData.map((payment) => ({
          id: payment.id,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          transactionTime: payment.transactionTime ? new Date(payment.transactionTime) : undefined, // Convert string to Date
          expiryTime: payment.expiryTime ? new Date(payment.expiryTime) : undefined,
          vaNumber: payment.vaNumber,
          bank: payment.bank,
          qrCode: payment.qrCode,
          redirectUrl: payment.redirectUrl,
          createdAt: new Date(payment.createdAt), // Convert string to Date
          updatedAt: new Date(payment.updatedAt)
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
      
      const paymentHistory = await PaymentHistoryRepository.findById(id);
      
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
          transactionTime: paymentHistory.transactionTime ? new Date(paymentHistory.transactionTime) : undefined,
          expiryTime: paymentHistory.expiryTime ? new Date(paymentHistory.expiryTime) : undefined,
          vaNumber: paymentHistory.vaNumber,
          bank: paymentHistory.bank,
          qrCode: paymentHistory.qrCode,
          redirectUrl: paymentHistory.redirectUrl,
          createdAt: new Date(paymentHistory.createdAt),
          updatedAt: new Date(paymentHistory.updatedAt)
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
      
      const skip = (page - 1) * limit;
      
      const result = await PaymentHistoryRepository.findByUserId(userId, skip, limit);
      
      const total = result.total;
      const totalPages = Math.ceil(total / limit);
      
      const paymentHistoriesData = result.rows;
      
      logger.info(`Successfully fetched ${paymentHistoriesData.length} payment histories for user (User ID: ${userId}, Page: ${page}, Limit: ${limit}, Total: ${total})`);
      
      return {
        data: paymentHistoriesData.map((payment) => ({
          id: payment.id,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          transactionTime: payment.transactionTime ? new Date(payment.transactionTime) : undefined,
          expiryTime: payment.expiryTime ? new Date(payment.expiryTime) : undefined,
          vaNumber: payment.vaNumber,
          bank: payment.bank,
          qrCode: payment.qrCode,
          redirectUrl: payment.redirectUrl,
          createdAt: new Date(payment.createdAt),
          updatedAt: new Date(payment.updatedAt)
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
      
      const paymentHistoryData: Omit<IPaymentHistory, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
        userId: paymentData.userId,
        subscriptionId: paymentData.subscriptionId,
        orderId: paymentData.orderId,
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod as any,
        status: paymentData.status as any,
        transactionTime: paymentData.transactionTime instanceof Date ? paymentData.transactionTime.toISOString() : paymentData.transactionTime,
        expiryTime: paymentData.expiryTime instanceof Date ? paymentData.expiryTime.toISOString() : paymentData.expiryTime,
        vaNumber: paymentData.vaNumber,
        bank: paymentData.bank,
        qrCode: paymentData.qrCode,
        redirectUrl: paymentData.redirectUrl
      };
      
      const created = await PaymentHistoryRepository.create(paymentHistoryData);
      
      logger.info(`Successfully created payment history - ID: ${created.id}`);
      
      return {
        data: {
          id: created.id,
          userId: created.userId,
          subscriptionId: created.subscriptionId,
          orderId: created.orderId,
          paymentId: created.paymentId,
          amount: created.amount,
          currency: created.currency,
          paymentMethod: created.paymentMethod,
          status: created.status,
          transactionTime: created.transactionTime ? new Date(created.transactionTime) : undefined,
          expiryTime: created.expiryTime ? new Date(created.expiryTime) : undefined,
          vaNumber: created.vaNumber,
          bank: created.bank,
          qrCode: created.qrCode,
          redirectUrl: created.redirectUrl,
          createdAt: new Date(created.createdAt),
          updatedAt: new Date(created.updatedAt)
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
      
      // Find by orderId
      const existingPayment = await PaymentHistoryRepository.findByOrderId(orderId);
      
      if (!existingPayment) {
        logger.warn(`Payment history not found for update - Order ID: ${orderId}`);
        return PaymentHistoryErrorHandler.errors.notFound(orderId);
      }
      
      const updateData: Partial<IPaymentHistory> = { status: status as any };
      if (paymentId) {
        updateData.paymentId = paymentId;
      }
      
      await PaymentHistoryRepository.update(existingPayment.id, updateData);
      const paymentHistory = await PaymentHistoryRepository.findById(existingPayment.id);
      
      if (!paymentHistory) throw new Error("Failed to fetch updated payment history");

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
          transactionTime: paymentHistory.transactionTime ? new Date(paymentHistory.transactionTime) : undefined,
          expiryTime: paymentHistory.expiryTime ? new Date(paymentHistory.expiryTime) : undefined,
          vaNumber: paymentHistory.vaNumber,
          bank: paymentHistory.bank,
          qrCode: paymentHistory.qrCode,
          redirectUrl: paymentHistory.redirectUrl,
          createdAt: new Date(paymentHistory.createdAt),
          updatedAt: new Date(paymentHistory.updatedAt)
        },
        message: "Berhasil memperbarui status riwayat pembayaran",
        success: true
      };
      
    } catch (error) {
      return PaymentHistoryErrorHandler.handleDatabaseError(error, `update payment history status for order ID: ${orderId}`);
    }
  }
}