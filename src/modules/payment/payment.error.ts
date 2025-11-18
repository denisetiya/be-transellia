import { PaymentError, PaymentErrorType } from './payment.type';
import logger from '../../lib/lib.logger';

export default class PaymentErrorHandler {
  static handleValidationError(message: string): PaymentError {
    logger.warn(`Payment validation error: ${message}`);
    return {
      data: null,
      message,
      success: false,
      errorType: PaymentErrorType.VALIDATION_ERROR
    };
  }

  static handleMidtransError(error: unknown, operation: string): PaymentError {
    logger.error(`Midtrans error during ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      data: null,
      message: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      success: false,
      errorType: PaymentErrorType.MIDTRANS_ERROR
    };
  }

  static handleDatabaseError(error: unknown, operation: string): PaymentError {
    logger.error(`Database error during ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      data: null,
      message: 'Database operation failed',
      success: false,
      errorType: PaymentErrorType.DATABASE_ERROR
    };
  }

  static handleInternalError(error: unknown, operation: string): PaymentError {
    logger.error(`Internal error during ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      data: null,
      message: 'Internal server error occurred',
      success: false,
      errorType: PaymentErrorType.INTERNAL_ERROR
    };
  }
}