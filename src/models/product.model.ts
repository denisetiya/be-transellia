import mongoose, { Schema, Document } from 'mongoose';

export interface IProductInput {
  storeId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  storeId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, index: true },
}, { timestamps: true });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

export class ProductRepository {
  static async findById(id: string): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ProductModel.findById(id).exec();
  }

  static async findByStoreId(storeId: string): Promise<IProduct[]> {
    return ProductModel.find({ storeId }).exec();
  }

  static async findBySku(sku: string, storeId: string): Promise<IProduct | null> {
    return ProductModel.findOne({ sku, storeId }).exec();
  }

  static async create(data: IProductInput): Promise<IProduct> {
    const product = new ProductModel(data);
    return product.save();
  }

  static async update(id: string, data: Partial<IProductInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await ProductModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  static async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await ProductModel.findByIdAndDelete(id).exec();
  }
}
