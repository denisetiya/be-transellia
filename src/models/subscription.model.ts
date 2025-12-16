import mongoose, { Schema, Document } from 'mongoose';
import type { Status, DurationUnit } from './enums';
import { StatusValues, DurationUnitValues } from './enums';

// Input type for creating/updating
export interface ISubscriptionListInput {
  name: string;
  price: number;
  currency: string;
  description?: string;
  durationValue: number;
  durationUnit: DurationUnit;
  features: string[];
  status: Status;
  subscribersCount: number;
  totalRevenue: number;
}

export interface ISubscriptionList extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  currency: string;
  description?: string;
  durationValue: number;
  durationUnit: DurationUnit;
  features: string[];
  status: Status;
  subscribersCount: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionListSchema = new Schema<ISubscriptionList>({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'IDR' },
  description: String,
  durationValue: { type: Number, required: true },
  durationUnit: { type: String, enum: DurationUnitValues, required: true },
  features: [{ type: String }],
  status: { type: String, enum: StatusValues, default: 'active' },
  subscribersCount: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

export const SubscriptionListModel = mongoose.model<ISubscriptionList>('SubscriptionList', SubscriptionListSchema);

export class SubscriptionListRepository {
  static async findById(id: string): Promise<ISubscriptionList | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return SubscriptionListModel.findById(id).exec();
  }

  static async findByName(name: string): Promise<ISubscriptionList | null> {
    return SubscriptionListModel.findOne({ name }).exec();
  }

  static async findAllActive(): Promise<ISubscriptionList[]> {
    return SubscriptionListModel.find({ status: 'active' }).exec();
  }

  static async create(data: ISubscriptionListInput): Promise<ISubscriptionList> {
    const subscription = new SubscriptionListModel(data);
    return subscription.save();
  }

  static async update(id: string, data: Partial<ISubscriptionListInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await SubscriptionListModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await SubscriptionListModel.findByIdAndDelete(id).exec();
  }
}
