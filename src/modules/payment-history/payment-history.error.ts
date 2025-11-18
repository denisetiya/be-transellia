import logger from '../../lib/lib.logger';
import { PaymentHistoryError, PaymentHistoryErrorType } from './payment-history.type';

export default class PaymentHistoryErrorHandler {
  static errors = {
    notFound: (id: string): PaymentHistoryError => {
      logger.warn(`Payment history not found - ID: ${id}`);
      return {
        data: null,
        message: `Payment history with ID ${id} not found`,
        success: false,
        errorType: PaymentHistoryErrorType.NOT_FOUND
      };
    }
  };

  static handleDatabaseError(error: unknown, operation: string): PaymentHistoryError {
    logger.error(`Database error during ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error && error.message.includes('Connection')) {
      return {
        data: null,
        message: 'Database connection error',
        success: false,
        errorType: PaymentHistoryErrorType.DATABASE_CONNECTION
      };
    }
    
    return {
      data: null,
      message: 'Database operation failed',
      success: false,
      errorType: PaymentHistoryErrorType.INTERNAL_ERROR
    };
  }

  static handleValidationError(message: string): PaymentHistoryError {
    logger.warn(`Payment history validation error: ${message}`);
    return {
      data: null,
      message,
      success: false,
      errorType: PaymentHistoryErrorType.VALIDATION_ERROR
    };
  }
}