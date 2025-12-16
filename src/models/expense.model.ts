import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseInput {
  storeId: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
}

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  storeId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

export const ExpenseModel = mongoose.model<IExpense>('Expense', ExpenseSchema);

export class ExpenseRepository {
  static async findById(id: string): Promise<IExpense | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ExpenseModel.findById(id).exec();
  }

  static async findByStoreId(storeId: string): Promise<IExpense[]> {
    return ExpenseModel.find({ storeId }).exec();
  }

  static async create(data: IExpenseInput): Promise<IExpense> {
    const expense = new ExpenseModel(data);
    return expense.save();
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await ExpenseModel.findByIdAndDelete(id).exec();
  }
}
