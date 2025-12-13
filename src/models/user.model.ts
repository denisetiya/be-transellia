import { BaseRepository, IBaseDocument } from './base.repository';
import type { Role } from './enums';

export interface IUser extends IBaseDocument {
  type: 'User';
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

export class UserRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'User';

  static async findByEmail(email: string): Promise<IUser | null> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.email = $1', undefined, 1);
    return this.executeQueryOne<IUser>(query, [email]);
  }

  static async findById(id: string): Promise<IUser | null> {
    return this.getById<IUser>(id);
  }

  static async create(data: Omit<IUser, 'id' | 'type' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<IUser> {
    const id = data.id || this.generateId();
    const now = this.now();
    
    const doc: IUser = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }

  static async update(id: string, data: Partial<IUser>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('User not found');
    
    const updated: IUser = {
      ...current,
      ...data,
      updatedAt: this.now(),
    };
    
    await this.replaceDoc(id, updated);
  }
  
  static async updateById(id: string, data: Partial<IUser>): Promise<void> {
    return this.update(id, data);
  }

  static async findBySubscriptionId(subscriptionId: string): Promise<IUser[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.subscriptionId = $1');
    return this.executeQuery<IUser>(query, [subscriptionId]);
  }

  static async findAllPaginated(skip: number = 0, limit: number = 10): Promise<{ rows: IUser[], total: number }> {
    const query = this.buildSelectQuery(this.DOC_TYPE, undefined, undefined, limit, skip);
    const countQuery = this.buildCountQuery(this.DOC_TYPE);
    
    const [rows, countResult] = await Promise.all([
      this.executeQuery<IUser>(query),
      this.executeQueryOne<{ total: number }>(countQuery)
    ]);
    
    return {
      rows,
      total: countResult?.total || 0
    };
  }

  static async delete(id: string): Promise<void> {
    await this.removeDoc(id);
  }
}
