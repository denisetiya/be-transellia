import type { Request, Response } from 'express';
import logger from '../../lib/lib.logger';
import response from '../../lib/lib.response';
import PaymentService from './payment.service';
import { createValidationErrorResponse } from '../../lib/lib.validation';
import { createPaymentSchema, getPaymentStatusSchema } from './payment.validation';

export default class PaymentController {
  /**
   * Create a new payment
   */
  static async createPayment(req: Request, res: Response) {
    try {
      logger.info('Creating new payment');

      // Validate request body
      const validation = createPaymentSchema.safeParse({ body: req.body });
      if (!validation.success) {
        logger.warn('Payment creation validation failed');
        const validationError = createValidationErrorResponse(validation.error);
        return response.badRequest(
          res,
          validationError.message,
          validationError.errors
        );
      }

      const paymentRequest = validation.data.body;
      
      // Create payment using service
      const result = await PaymentService.createPayment(paymentRequest);
      
      if (result.success) {
        logger.info(`Payment created successfully for order ${paymentRequest.orderId}`);
        return response.success(
          res,
          {
            payment: result.data
          },
          result.message
        );
      }
      
      // Handle service errors
      switch (result.errorType) {
        case 'VALIDATION_ERROR':
          return response.badRequest(res, result.message);
        case 'MIDTRANS_ERROR':
          return response.internalServerError(res, result.message);
        default:
          return response.internalServerError(res, result.message);
      }
      
    } catch (error) {
      // Handle unexpected exceptions
      logger.error(`Unexpected error in createPayment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return response.internalServerError(
        res,
        "Terjadi kesalahan sistem. Silakan coba lagi."
      );
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(req: Request, res: Response) {
    try {
      logger.info('Getting payment status');

      // Validate request parameters
      const validation = getPaymentStatusSchema.safeParse({ params: req.params });
      if (!validation.success) {
        logger.warn('Payment status validation failed');
        const validationError = createValidationErrorResponse(validation.error);
        return response.badRequest(
          res,
          validationError.message,
          validationError.errors
        );
      }

      const { orderId } = validation.data.params;
      
      // Get payment status using service
      const result = await PaymentService.getPaymentStatus(orderId);
      
      if (result.success) {
        logger.info(`Payment status retrieved successfully for order ${orderId}`);
        return response.success(
          res,
          {
            payment: result.data
          },
          result.message
        );
      }
      
      // Handle service errors
      switch (result.errorType) {
        case 'VALIDATION_ERROR':
          return response.badRequest(res, result.message);
        case 'MIDTRANS_ERROR':
          return response.internalServerError(res, result.message);
        default:
          return response.internalServerError(res, result.message);
      }
      
    } catch (error) {
      // Handle unexpected exceptions
      logger.error(`Unexpected error in getPaymentStatus: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return response.internalServerError(
        res,
        "Terjadi kesalahan sistem. Silakan coba lagi."
      );
    }
  }
}