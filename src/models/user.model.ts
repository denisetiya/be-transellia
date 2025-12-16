import mongoose, { Schema, Document } from 'mongoose';
import type { Role } from './enums';
import { RoleValues } from './enums';

// Input type for creating/updating (plain object)
export interface IUserInput {
  email: string;
  password: string;
  role: Role;
  isEmployee: boolean;
  subscriptionId?: string;
  userDetails?: {
    name?: string;
    imageProfile?: string;
    phoneNumber?: string;
    address?: string;
  };
}

// Document type (extends Mongoose Document)
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: Role;
  isEmployee: boolean;
  subscriptionId?: string;
  userDetails?: {
    name?: string;
    imageProfile?: string;
    phoneNumber?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: RoleValues, default: 'user' },
  isEmployee: { type: Boolean, default: false },
  subscriptionId: { type: String, index: true },
  userDetails: {
    name: String,
    imageProfile: String,
    phoneNumber: String,
    address: String,
  },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// Repository class for backward compatibility
export class UserRepository {
  static async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  static async findById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id).exec();
  }

  static async create(data: IUserInput & { id?: string }): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  static async update(id: string, data: Partial<IUserInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await UserModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  static async updateById(id: string, data: Partial<IUserInput>): Promise<void> {
    return this.update(id, data);
  }

  static async findBySubscriptionId(subscriptionId: string): Promise<IUser[]> {
    return UserModel.find({ subscriptionId }).exec();
  }

  static async findAllPaginated(skip: number = 0, limit: number = 10): Promise<{ rows: IUser[], total: number }> {
    const [rows, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).exec(),
      UserModel.countDocuments().exec()
    ]);
    return { rows, total };
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await UserModel.findByIdAndDelete(id).exec();
  }
}
