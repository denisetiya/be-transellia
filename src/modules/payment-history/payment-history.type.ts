export interface iPaymentHistory {
  id: string;
  userId: string;
 subscriptionId: string;
  orderId: string;
  paymentId?: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionTime?: Date | null;
  expiryTime?: Date | null;
  vaNumber?: string | null;
  bank?: string | null;
  qrCode?: string | null;
  redirectUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentHistoryErrorType {
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface PaymentHistoryError {
  data: null;
  message: string;
  success: false;
  errorType: PaymentHistoryErrorType;
}

export interface PaymentHistorySuccess {
  data: iPaymentHistory;
  message: string;
  success: true;
}

export interface PaymentHistoriesSuccess {
  data: iPaymentHistory[];
  message: string;
  success: true;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type PaymentHistoryResult = PaymentHistorySuccess | PaymentHistoryError;
export type PaymentHistoriesResult = PaymentHistoriesSuccess | PaymentHistoryError;