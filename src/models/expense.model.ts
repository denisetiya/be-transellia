import { BaseRepository, IBaseDocument } from './base.repository';

export interface IExpense extends IBaseDocument {
  type: 'Expense';
  storeId: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
}

export class ExpenseRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'Expense';

  static async findById(id: string): Promise<IExpense | null> {
    return this.getById<IExpense>(id);
  }

  static async findByStoreId(storeId: string): Promise<IExpense[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.storeId = $1');
    return this.executeQuery<IExpense>(query, [storeId]);
  }

  static async create(data: Omit<IExpense, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IExpense> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IExpense = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }
  
  static async delete(id: string): Promise<void> {
    await this.removeDoc(id);
  }
}
