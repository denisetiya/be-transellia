export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
 customer: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  paymentMethod: 'va' | 'qr' | 'wallet';
  bank?: string; // For VA payments
  walletProvider?: string; // For wallet payments
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    paymentId?: string;
    redirectUrl?: string;
    qrCode?: string;
    vaNumber?: string;
    expiryTime?: string;
  };
  errorType?: string;
}

export interface MidtransPaymentResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
 qr_code?: string;
  redirect_url?: string;
 expiry_time?: string;
}

export enum PaymentErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MIDTRANS_ERROR = 'MIDTRANS_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface PaymentError {
  data: null;
  message: string;
  success: false;
  errorType: PaymentErrorType;
}

export interface PaymentSuccess {
  data: {
    orderId: string;
    paymentId?: string;
    redirectUrl?: string;
    qrCode?: string;
    vaNumber?: string;
    expiryTime?: string;
  };
  message: string;
  success: true;
}

export type PaymentResult = PaymentSuccess | PaymentError;