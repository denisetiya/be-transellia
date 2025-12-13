import { BaseRepository, IBaseDocument } from './base.repository';
import type { PayrollStatus } from './enums';

export interface IPayroll extends IBaseDocument {
  type: 'Payroll';
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  bonus: number;
  deduction: number;
  netAmount: number;
  status: PayrollStatus;
  paidDate?: string;
}

export class PayrollRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'Payroll';

  static async findById(id: string): Promise<IPayroll | null> {
    return this.getById<IPayroll>(id);
  }

  static async findByEmployeeId(employeeId: string): Promise<IPayroll[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.employeeId = $1');
    return this.executeQuery<IPayroll>(query, [employeeId]);
  }

  static async create(data: Omit<IPayroll, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IPayroll> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IPayroll = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }
  
  static async update(id: string, data: Partial<IPayroll>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Payroll not found');
    
    const updated: IPayroll = {
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
