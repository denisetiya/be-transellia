import { BaseRepository, IBaseDocument } from './base.repository';
import type { PaymentMethod } from './enums';

export interface ISaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IHistorySale extends IBaseDocument {
  type: 'HistorySale';
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

export class HistorySaleRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'HistorySale';

  static async findById(id: string): Promise<IHistorySale | null> {
    return this.getById<IHistorySale>(id);
  }

  static async findByStoreId(storeId: string): Promise<IHistorySale[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.storeId = $1');
    return this.executeQuery<IHistorySale>(query, [storeId]);
  }

  static async findByReceiptNumber(receiptNumber: string): Promise<IHistorySale | null> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.receiptNumber = $1', undefined, 1);
    return this.executeQueryOne<IHistorySale>(query, [receiptNumber]);
  }

  static async create(data: Omit<IHistorySale, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IHistorySale> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IHistorySale = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }
}
