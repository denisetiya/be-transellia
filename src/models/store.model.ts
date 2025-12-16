import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreInput {
  userId: string;
  name: string;
  address?: string;
}

export interface IStore extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  address: String,
}, { timestamps: true });

export const StoreModel = mongoose.model<IStore>('Store', StoreSchema);

export class StoreRepository {
  static async findById(id: string): Promise<IStore | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return StoreModel.findById(id).exec();
  }

  static async findByUserId(userId: string): Promise<IStore[]> {
    return StoreModel.find({ userId }).exec();
  }

  static async create(data: IStoreInput): Promise<IStore> {
    const store = new StoreModel(data);
    return store.save();
  }

  static async update(id: string, data: Partial<IStoreInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await StoreModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await StoreModel.findByIdAndDelete(id).exec();
  }
}
