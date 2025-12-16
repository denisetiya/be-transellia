import mongoose, { Schema, Document } from 'mongoose';
import type { PayrollStatus } from './enums';
import { PayrollStatusValues } from './enums';

export interface IPayrollInput {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  bonus: number;
  deduction: number;
  netAmount: number;
  status: PayrollStatus;
  paidDate?: string;
}

export interface IPayroll extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  bonus: number;
  deduction: number;
  netAmount: number;
  status: PayrollStatus;
  paidDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>({
  employeeId: { type: String, required: true, index: true },
  periodStart: { type: String, required: true },
  periodEnd: { type: String, required: true },
  amount: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  status: { type: String, enum: PayrollStatusValues, default: 'draft' },
  paidDate: String,
}, { timestamps: true });

export const PayrollModel = mongoose.model<IPayroll>('Payroll', PayrollSchema);

export class PayrollRepository {
  static async findById(id: string): Promise<IPayroll | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return PayrollModel.findById(id).exec();
  }

  static async findByEmployeeId(employeeId: string): Promise<IPayroll[]> {
    return PayrollModel.find({ employeeId }).exec();
  }

  static async create(data: IPayrollInput): Promise<IPayroll> {
    const payroll = new PayrollModel(data);
    return payroll.save();
  }

  static async update(id: string, data: Partial<IPayrollInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await PayrollModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await PayrollModel.findByIdAndDelete(id).exec();
  }
}
