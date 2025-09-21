import { z } from 'zod';

export const subscriptionPaymentSchema = z.object({
  body: z.object({
    subscriptionId: z.string().min(1, 'Subscription ID is required'),
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

export type SubscriptionPaymentRequest = z.infer<typeof subscriptionPaymentSchema>['body'];