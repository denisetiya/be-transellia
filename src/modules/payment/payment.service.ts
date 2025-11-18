import midtransApi from '../../config/midtrans.config';
import logger from '../../lib/lib.logger';
import { PaymentRequest, PaymentResult, MidtransPaymentResponse, PaymentSuccess } from './payment.type';
import PaymentErrorHandler from './payment.error';

export default class PaymentService {
  /**
   * Create a payment using Midtrans
   * @param paymentRequest - The payment request details
   * @returns PaymentResult with success or error information
   */
  static async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      logger.info(`Creating payment for order ${paymentRequest.orderId} using ${paymentRequest.paymentMethod}`);

      // Prepare Midtrans payment parameters based on payment method
      const midtransParams: Record<string, unknown> = {
        transaction_details: {
          order_id: paymentRequest.orderId,
          gross_amount: paymentRequest.amount
        },
        customer_details: {
          first_name: paymentRequest.customer.firstName,
          last_name: paymentRequest.customer.lastName,
          email: paymentRequest.customer.email,
          phone: paymentRequest.customer.phone
        },
        credit_card: {
          secure: true
        }
      };

      // Add payment method specific parameters
      switch (paymentRequest.paymentMethod) {
        case 'va':
          if (!paymentRequest.bank) {
            return PaymentErrorHandler.handleValidationError('Bank is required for VA payments');
          }
          
          midtransParams.payment_type = 'bank_transfer';
          
          if (paymentRequest.bank === 'bca') {
            midtransParams.bank_transfer = {
              bank: 'bca'
            };
          } else if (paymentRequest.bank === 'bni') {
            midtransParams.bank_transfer = {
              bank: 'bni'
            };
          } else if (paymentRequest.bank === 'permata') {
            midtransParams.bank_transfer = {
              bank: 'permata'
            };
          } else {
            return PaymentErrorHandler.handleValidationError(`Unsupported bank: ${paymentRequest.bank}`);
          }
          break;

        case 'qr':
          midtransParams.payment_type = 'gopay';
          midtransParams.gopay = {
            enable_callback: true,
            callback_url: 'https://your-website.com/payment/callback'
          };
          break;

        case 'wallet':
          if (!paymentRequest.walletProvider) {
            return PaymentErrorHandler.handleValidationError('Wallet provider is required for wallet payments');
          }
          
          if (paymentRequest.walletProvider === 'gopay') {
            midtransParams.payment_type = 'gopay';
            midtransParams.gopay = {
              enable_callback: true,
              callback_url: 'https://your-website.com/payment/callback'
            };
          } else if (paymentRequest.walletProvider === 'ovo') {
            midtransParams.payment_type = 'ovo';
          } else if (paymentRequest.walletProvider === 'dana') {
            midtransParams.payment_type = 'dana';
          } else if (paymentRequest.walletProvider === 'linkaja') {
            midtransParams.payment_type = 'linkaja';
          } else {
            return PaymentErrorHandler.handleValidationError(`Unsupported wallet provider: ${paymentRequest.walletProvider}`);
          }
          break;

        default:
          return PaymentErrorHandler.handleValidationError(`Unsupported payment method: ${paymentRequest.paymentMethod}`);
      }

      // Create payment transaction with Midtrans
      const response: MidtransPaymentResponse = await midtransApi.charge(midtransParams);
      
      logger.info(`Payment created successfully for order ${paymentRequest.orderId}`);

      // Process response based on payment method
      const resultData: PaymentSuccess['data'] = {
        orderId: response.order_id,
        paymentId: response.transaction_id
      };

      if (response.va_numbers && response.va_numbers.length > 0) {
        // VA payment
        resultData.vaNumber = response.va_numbers[0]?.va_number;
        resultData.bank = response.va_numbers[0]?.bank;
      } else if (response.permata_va_number) {
        // Permata VA payment
        resultData.vaNumber = response.permata_va_number;
        resultData.bank = 'permata';
      } else if (response.qr_code) {
        // QR payment
        resultData.qrCode = response.qr_code;
      } else if (response.redirect_url) {
        // Wallet payment with redirect
        resultData.redirectUrl = response.redirect_url;
      }

      if (response.expiry_time) {
        resultData.expiryTime = response.expiry_time;
      }

      return {
        data: resultData,
        message: 'Payment created successfully',
        success: true
      };

    } catch (error) {
      return PaymentErrorHandler.handleMidtransError(error, 'create payment');
    }
  }

  /**
   * Get payment status from Midtrans
   * @param orderId - The order ID to check status for
   * @returns PaymentResult with status information
   */
  static async getPaymentStatus(orderId: string): Promise<PaymentResult> {
    try {
      logger.info(`Checking payment status for order ${orderId}`);

      // Get transaction status from Midtrans
      // @ts-expect-error: Midtrans CoreApi types may not be fully defined
      const response: MidtransPaymentResponse = await midtransApi.status(orderId);
      
      logger.info(`Payment status retrieved for order ${orderId}`);

      // Create result data matching PaymentSuccess data structure
      const resultData: PaymentSuccess['data'] = {
        orderId: response.order_id,
        paymentId: response.transaction_id
      };

      // Add payment method specific data
      if (response.va_numbers && response.va_numbers.length > 0) {
        resultData.vaNumber = response.va_numbers[0]?.va_number;
      } else if (response.permata_va_number) {
        resultData.vaNumber = response.permata_va_number;
      } else if (response.qr_code) {
        resultData.qrCode = response.qr_code;
      } else if (response.redirect_url) {
        resultData.redirectUrl = response.redirect_url;
      }

      if (response.expiry_time) {
        resultData.expiryTime = response.expiry_time;
      }

      return {
        data: resultData,
        message: 'Payment status retrieved successfully',
        success: true
      };

    } catch (error) {
      return PaymentErrorHandler.handleMidtransError(error, 'get payment status');
    }
  }
}