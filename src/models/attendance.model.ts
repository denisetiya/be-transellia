import mongoose, { Schema, Document } from 'mongoose';
import type { AttendanceStatus } from './enums';
import { AttendanceStatusValues } from './enums';

export interface IAttendanceInput {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  status: { type: String, enum: AttendanceStatusValues, required: true },
  checkInTime: String,
  checkOutTime: String,
  latitude: Number,
  longitude: Number,
  imageUrl: String,
}, { timestamps: true });

AttendanceSchema.index({ employeeId: 1, date: 1 });

export const AttendanceModel = mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export class AttendanceRepository {
  static async findById(id: string): Promise<IAttendance | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return AttendanceModel.findById(id).exec();
  }

  static async findByEmployeeAndDate(employeeId: string, date: string): Promise<IAttendance | null> {
    return AttendanceModel.findOne({ employeeId, date }).exec();
  }

  static async findByEmployeeId(employeeId: string): Promise<IAttendance[]> {
    return AttendanceModel.find({ employeeId }).exec();
  }

  static async create(data: IAttendanceInput): Promise<IAttendance> {
    const attendance = new AttendanceModel(data);
    return attendance.save();
  }

  static async update(id: string, data: Partial<IAttendanceInput>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid ID');
    await AttendanceModel.findByIdAndUpdate(id, { $set: data }).exec();
  }
}
