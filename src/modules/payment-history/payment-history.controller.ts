import type { Request, Response } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import PaymentHistoryService from './payment-history.service';
import { createValidationErrorResponse } from '../../lib/lib.validation';

export default class PaymentHistoryController {
  static async getAllPaymentHistories(req: Request, res: Response) {
    try {
      logger.info('Fetching all payment histories with pagination');
      
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Validate pagination parameters
      if (page < 1 || isNaN(page)) {
        return response.badRequest(
          res,
          "Parameter 'page' harus berupa angka positif"
        );
      }
      
      if (limit < 1 || limit > 100 || isNaN(limit)) {
        return response.badRequest(
          res,
          "Parameter 'limit' harus berupa angka antara 1 dan 100"
        );
      }
      
      const result = await PaymentHistoryService.getAllPaymentHistories(page, limit);
      
      if (result.success) {
        logger.info(`Successfully fetched ${result.data.length} payment histories (Page: ${page}, Limit: ${limit})`);
        return response.success(
          res,
          {
            paymentHistories: result.data,
          },
          result.message,
          result.meta
        );
      }
      
      // Handle service errors
      return response.internalServerError(
        res,
        result.message
      );
      
    } catch (error) {
      // Handle unexpected exceptions
      logger.error(`Unexpected error in getAllPaymentHistories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return response.internalServerError(
        res,
        "Terjadi kesalahan sistem. Silakan coba lagi."
      );
    }
  }

  static async getPaymentHistoryById(req: Request, res: Response) {
    try {
      logger.info(`Fetching payment history by ID: ${req.params.id}`);
      
      // Check if ID exists
      if (!req.params.id) {
        return response.badRequest(
          res,
          "ID riwayat pembayaran wajib diisi"
        );
      }
      
      const id = req.params.id;
      
      const result = await PaymentHistoryService.getPaymentHistoryById(id);
      
      if (result.success) {
        logger.info(`Successfully fetched payment history - ID: ${result.data.id}`);
        return response.success(
          res,
          {
            paymentHistory: result.data,
          },
          result.message
        );
      }
      
      // Handle service errors
      switch (result.errorType) {
        case 'NOT_FOUND':
          return response.notFound(
            res,
            result.message
          );
        default:
          return response.internalServerError(
            res,
            result.message
          );
      }
      
    } catch (error) {
      // Handle unexpected exceptions
      logger.error(`Unexpected error in getPaymentHistoryById: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return response.internalServerError(
        res,
        "Terjadi kesalahan sistem. Silakan coba lagi."
      );
    }
  }

  static async getPaymentHistoriesByUserId(req: Request, res: Response) {
    try {
      logger.info(`Fetching payment histories by user ID: ${req.params.userId}`);
      
      // Check if user ID exists
      if (!req.params.userId) {
        return response.badRequest(
          res,
          "ID pengguna wajib diisi"
        );
      }
      
      const userId = req.params.userId;
      
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Validate pagination parameters
      if (page < 1 || isNaN(page)) {
        return response.badRequest(
          res,
          "Parameter 'page' harus berupa angka positif"
        );
      }
      
      if (limit < 1 || limit > 100 || isNaN(limit)) {
        return response.badRequest(
          res,
          "Parameter 'limit' harus berupa angka antara 1 dan 100"
        );
      }
      
      const result = await PaymentHistoryService.getPaymentHistoriesByUserId(userId, page, limit);
      
      if (result.success) {
        logger.info(`Successfully fetched ${result.data.length} payment histories for user (User ID: ${userId}, Page: ${page}, Limit: ${limit})`);
        return response.success(
          res,
          {
            paymentHistories: result.data,
          },
          result.message,
          result.meta
        );
      }
      
      // Handle service errors
      switch (result.errorType) {
        case 'NOT_FOUND':
          return response.notFound(
            res,
            result.message
          );
        default:
          return response.internalServerError(
            res,
            result.message
          );
      }
      
    } catch (error) {
      // Handle unexpected exceptions
      logger.error(`Unexpected error in getPaymentHistoriesByUserId: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return response.internalServerError(
        res,
        "Terjadi kesalahan sistem. Silakan coba lagi."
      );
    }
  }
}