import { BaseRepository, IBaseDocument } from './base.repository';
import type { Status, DurationUnit } from './enums';

export interface ISubscriptionList extends IBaseDocument {
  type: 'SubscriptionList';
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

export class SubscriptionListRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'SubscriptionList';

  static async findById(id: string): Promise<ISubscriptionList | null> {
    return this.getById<ISubscriptionList>(id);
  }

  static async findByName(name: string): Promise<ISubscriptionList | null> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.name = $1', undefined, 1);
    return this.executeQueryOne<ISubscriptionList>(query, [name]);
  }

  static async findAllActive(): Promise<ISubscriptionList[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, "t.status = 'active'");
    return this.executeQuery<ISubscriptionList>(query);
  }

  static async create(data: Omit<ISubscriptionList, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<ISubscriptionList> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: ISubscriptionList = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }

  static async update(id: string, data: Partial<ISubscriptionList>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Subscription not found');
    
    const updated: ISubscriptionList = {
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
