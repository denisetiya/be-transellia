import mongoose, { Schema, Document } from 'mongoose';
import type { PaymentMethod } from './enums';
import { PaymentMethodValues } from './enums';

export interface ISaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IHistorySaleInput {
  storeId: string;
  employeeId?: string;
  items: ISaleItem[];
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface IHistorySale extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: string;
  employeeId?: string;
  items: ISaleItem[];
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { _id: false });

const HistorySaleSchema = new Schema<IHistorySale>({
  storeId: { type: String, required: true, index: true },
  employeeId: String,
  items: [SaleItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: PaymentMethodValues },
  customerName: String,
  customerPhone: String,
  receiptNumber: { type: String, index: true },
  notes: String,
}, { timestamps: true });

export const HistorySaleModel = mongoose.model<IHistorySale>('HistorySale', HistorySaleSchema);

export class HistorySaleRepository {
  static async findById(id: string): Promise<IHistorySale | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return HistorySaleModel.findById(id).exec();
  }

  static async findByStoreId(storeId: string): Promise<IHistorySale[]> {
    return HistorySaleModel.find({ storeId }).sort({ createdAt: -1 }).exec();
  }

  static async findByReceiptNumber(receiptNumber: string): Promise<IHistorySale | null> {
    return HistorySaleModel.findOne({ receiptNumber }).exec();
  }

  static async create(data: IHistorySaleInput): Promise<IHistorySale> {
    const sale = new HistorySaleModel(data);
    return sale.save();
  }
}
