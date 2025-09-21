import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(1, 'Currency is required').default('IDR'),
    customer: z.object({
      id: z.string().min(1, 'Customer ID is required'),
      email: z.string().email('Invalid email format'),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional()
    }),
    paymentMethod: z.enum(['va', 'qr', 'wallet'], {
      message: 'Payment method must be va, qr, or wallet'
    }),
    bank: z.string().optional(), // Required for VA payments
    walletProvider: z.string().optional() // Required for wallet payments
  }).superRefine((data, ctx) => {
    // Additional validation for payment method specific fields
    if (data.paymentMethod === 'va' && !data.bank) {
      ctx.addIssue({
        path: ['bank'],
        message: 'Bank is required for VA payments',
        code: 'custom'
      });
    }
    
    if (data.paymentMethod === 'wallet' && !data.walletProvider) {
      ctx.addIssue({
        path: ['walletProvider'],
        message: 'Wallet provider is required for wallet payments',
        code: 'custom'
      });
    }
  })
});

export const getPaymentStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  })
});

export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>['body'];
export type GetPaymentStatusRequest = z.infer<typeof getPaymentStatusSchema>['params'];