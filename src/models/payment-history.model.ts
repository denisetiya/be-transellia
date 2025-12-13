import { BaseRepository, IBaseDocument } from './base.repository';
import type { PaymentMethod, PaymentStatus } from './enums';

export interface IPaymentHistory extends IBaseDocument {
  type: 'PaymentHistory';
  userId: string;
  subscriptionId: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod | 'va' | 'qr' | 'wallet' | 'credit_card';
  status: PaymentStatus | 'pending' | 'success' | 'failed' | 'expired';
  transactionTime?: string;
  expiryTime?: string;
  vaNumber?: string;
  bank?: string;
  qrCode?: string;
  redirectUrl?: string;
}

export class PaymentHistoryRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'PaymentHistory';

  static async findById(id: string): Promise<IPaymentHistory | null> {
    return this.getById<IPaymentHistory>(id);
  }

  static async findAll(skip: number = 0, limit: number = 10): Promise<{ rows: IPaymentHistory[], total: number }> {
    const query = this.buildSelectQuery(this.DOC_TYPE, undefined, undefined, limit, skip);
    const countQuery = this.buildCountQuery(this.DOC_TYPE);
    
    const [rows, countResult] = await Promise.all([
      this.executeQuery<IPaymentHistory>(query),
      this.executeQueryOne<{ total: number }>(countQuery)
    ]);
    
    return {
      rows,
      total: countResult?.total || 0
    };
  }

  static async findByUserId(userId: string, skip: number = 0, limit: number = 10): Promise<{ rows: IPaymentHistory[], total: number }> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.userId = $1', undefined, limit, skip);
    const countQuery = this.buildCountQuery(this.DOC_TYPE, 't.userId = $1');
    
    const [rows, countResult] = await Promise.all([
      this.executeQuery<IPaymentHistory>(query, [userId]),
      this.executeQueryOne<{ total: number }>(countQuery, [userId])
    ]);
    
    return {
      rows,
      total: countResult?.total || 0
    };
  }
  
  static async findByOrderId(orderId: string): Promise<IPaymentHistory | null> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.orderId = $1', undefined, 1);
    return this.executeQueryOne<IPaymentHistory>(query, [orderId]);
  }

  static async create(data: Omit<IPaymentHistory, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IPaymentHistory> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IPaymentHistory = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }
  
  static async update(id: string, data: Partial<IPaymentHistory>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('PaymentHistory not found');
    
    const updated: IPaymentHistory = {
      ...current,
      ...data,
      updatedAt: this.now(),
    };
    
    await this.replaceDoc(id, updated);
  }
}
