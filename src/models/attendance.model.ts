import { BaseRepository, IBaseDocument } from './base.repository';
import type { AttendanceStatus } from './enums';

export interface IAttendance extends IBaseDocument {
  type: 'Attendance';
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export class AttendanceRepository extends BaseRepository {
  private static readonly DOC_TYPE = 'Attendance';

  static async findById(id: string): Promise<IAttendance | null> {
    return this.getById<IAttendance>(id);
  }

  static async findByEmployeeAndDate(employeeId: string, date: string): Promise<IAttendance | null> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.employeeId = $1 AND t.date = $2', undefined, 1);
    return this.executeQueryOne<IAttendance>(query, [employeeId, date]);
  }
  
  static async findByEmployeeId(employeeId: string): Promise<IAttendance[]> {
    const query = this.buildSelectQuery(this.DOC_TYPE, 't.employeeId = $1');
    return this.executeQuery<IAttendance>(query, [employeeId]);
  }

  static async create(data: Omit<IAttendance, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<IAttendance> {
    const id = this.generateId();
    const now = this.now();
    
    const doc: IAttendance = {
      ...data,
      id,
      type: this.DOC_TYPE,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertDoc(id, doc);
    return doc;
  }

  static async update(id: string, data: Partial<IAttendance>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Attendance not found');
    
    const updated: IAttendance = {
      ...current,
      ...data,
      updatedAt: this.now(),
    };
    
    await this.replaceDoc(id, updated);
  }
}
