import mongoose, { Schema, Document } from 'mongoose';
import type { PaymentMethod, PaymentStatus } from './enums';
import { PaymentMethodValues, PaymentStatusValues } from './enums';

export interface IPaymentHistoryInput {
  userId: string;
  subscriptionId: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod | 'va' | 'qr' | 'wallet' | 'credit_card';
  status?: PaymentStatus | 'pending' | 'success' | 'failed' | 'expired';
  transactionTime?: string;
  expiryTime?: string;
  vaNumber?: string;
  bank?: string;
  qrCode?: string;
  redirectUrl?: string;
}

export interface IPaymentHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  subscriptionId: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod | 'va' | 'qr' | 'wallet' | 'credit_card';
  status: PaymentStatus | 'pending' | 'success' | 'failed' | 'expired';
  transactionTime?: string;
  expiryTime?: string;
  vaNumber?: string;
  bank?: string;
  qrCode?: string;
  redirectUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema<IPaymentHistory>({
  userId: { type: String, required: true, index: true },
  subscriptionId: { type: String, required: true },
  orderId: { type: String, required: true, unique: true, index: true },
  paymentId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'IDR' },
  paymentMethod: { type: String, enum: PaymentMethodValues },
  status: { type: String, enum: PaymentStatusValues, default: 'pending' },
  transactionTime: String,
  expiryTime: String,
  vaNumber: String,
  bank: String,
  qrCode: String,
  redirectUrl: String,
}, { timestamps: true });

export const PaymentHistoryModel = mongoose.model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);

export class PaymentHistoryRepository {
  static async findById(id: string): Promise<IPaymentHistory | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PaymentHistoryModel.findById(id).exec();
  }

  static async findAll(skip: number = 0, limit: number = 10): Promise<{ rows: IPaymentHistory[], total: number }> {
    const [rows, total] = await Promise.all([
      PaymentHistoryModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      PaymentHistoryModel.countDocuments().exec()
    ]);
    return { rows, total };
  }

  static async findByUserId(userId: string, skip: number = 0, limit: number = 10): Promise<{ rows: IPaymentHistory[], total: number }> {
    const [rows, total] = await Promise.all([
      PaymentHistoryModel.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      PaymentHistoryModel.countDocuments({ userId }).exec()
    ]);
    return { rows, total };
  }

  static async findByOrderId(orderId: string): Promise<IPaymentHistory | null> {
    return PaymentHistoryModel.findOne({ orderId }).exec();
  }

  static async create(data: IPaymentHistoryInput): Promise<IPaymentHistory> {
    const payment = new PaymentHistoryModel(data);
    return payment.save();
  }

  static async update(id: string, data: Partial<IPaymentHistoryInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await PaymentHistoryModel.findByIdAndUpdate(id, { $set: data }).exec();
  }
}
