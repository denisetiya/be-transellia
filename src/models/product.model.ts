import { BaseRepository, IBaseDocument } from './base.repository';

export interface IProduct extends IBaseDocument {
  type: 'Product';
  storeId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
}

export class ProductRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'Product';

  static async findById(id: string): Promise<IProduct | null> {
    return this.getById<IProduct>(id);
  }

  static async findByStoreId(storeId: string): Promise<IProduct[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.storeId = $1');
    return this.executeQuery<IProduct>(query, [storeId]);
  }
  
  static async findBySku(sku: string, storeId: string): Promise<IProduct | null> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.sku = $1 AND t.storeId = $2', undefined, 1);
    return this.executeQueryOne<IProduct>(query, [sku, storeId]);
  }

  static async create(data: Omit<IProduct, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IProduct = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }

  static async update(id: string, data: Partial<IProduct>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Product not found');
    
    const updated: IProduct = {
      ...current,
      ...data,
      updatedAt: this.now(),
    };
    
    await this.replaceDoc(id, updated);
  }
  
  static async delete(id: string): Promise<void> {
    await this.removeDoc(id);
  }
}
