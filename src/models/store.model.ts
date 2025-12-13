import { BaseRepository, IBaseDocument } from './base.repository';

export interface IStore extends IBaseDocument {
  type: 'Store';
  userId: string;
  name: string;
  address?: string;
}

export class StoreRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'Store';

  static async findById(id: string): Promise<IStore | null> {
    return this.getById<IStore>(id);
  }

  static async findByUserId(userId: string): Promise<IStore[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.userId = $1');
    return this.executeQuery<IStore>(query, [userId]);
  }

  static async create(data: Omit<IStore, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IStore> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IStore = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }

  static async update(id: string, data: Partial<IStore>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Store not found');
    
    const updated: IStore = {
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
