import { BaseRepository, IBaseDocument } from './base.repository';

export interface IEmployee extends IBaseDocument {
  type: 'Employee';
  userId: string;
  storeId: string;
  baseSalary: number;
}

export class EmployeeRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'Employee';

  static async findById(id: string): Promise<IEmployee | null> {
    return this.getById<IEmployee>(id);
  }

  static async findByStoreId(storeId: string): Promise<IEmployee[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.storeId = $1');
    return this.executeQuery<IEmployee>(query, [storeId]);
  }
  
  static async findByUserId(userId: string): Promise<IEmployee[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.userId = $1');
    return this.executeQuery<IEmployee>(query, [userId]);
  }

  static async create(data: Omit<IEmployee, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IEmployee> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IEmployee = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }
  
  static async update(id: string, data: Partial<IEmployee>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Employee not found');
    
    const updated: IEmployee = {
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
