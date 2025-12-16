import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeInput {
  userId: string;
  storeId: string;
  baseSalary: number;
}

export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  storeId: string;
  baseSalary: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  userId: { type: String, required: true, index: true },
  storeId: { type: String, required: true, index: true },
  baseSalary: { type: Number, required: true },
}, { timestamps: true });

export const EmployeeModel = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export class EmployeeRepository {
  static async findById(id: string): Promise<IEmployee | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return EmployeeModel.findById(id).exec();
  }

  static async findByStoreId(storeId: string): Promise<IEmployee[]> {
    return EmployeeModel.find({ storeId }).exec();
  }

  static async findByUserId(userId: string): Promise<IEmployee[]> {
    return EmployeeModel.find({ userId }).exec();
  }

  static async create(data: IEmployeeInput): Promise<IEmployee> {
    const employee = new EmployeeModel(data);
    return employee.save();
  }

  static async update(id: string, data: Partial<IEmployeeInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await EmployeeModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await EmployeeModel.findByIdAndDelete(id).exec();
  }
}
