import logger from '../../lib/lib.logger';
import { 
    EmployeeRepository, 
    AttendanceRepository, 
    PayrollRepository, 
    UserRepository,
    type IEmployee, 
    type IAttendance, 
    type IPayroll,
    type IUser,
    type AttendanceStatus,
    type PayrollStatus
} from '../../models';
import { generateId } from '../../lib/lib.id.generator';
import Hash from '../../lib/lib.hash';
import env from '../../config/env.config';

export interface EmployeeResult {
    data: (IEmployee & { id: string; user?: IUser }) | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export interface EmployeesResult {
    data: {
        employees: (IEmployee & { id: string })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    } | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export interface AttendanceResult {
    data: (IAttendance & { id: string }) | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export interface PayrollResult {
    data: (IPayroll & { id: string }) | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export default class EmployeeService {
    
    private static generateSaltFromEmail(email: string): string {
        return Hash.hash(email, env.SALT).substring(0, 16);
    }
    
    /**
     * Register a new employee (creates User + Employee record)
     */
    static async registerEmployee(
        storeId: string,
        data: {
            email: string;
            password: string;
            name: string;
            baseSalary?: number;
        }
    ): Promise<EmployeeResult> {
        try {
            logger.info(`Registering new employee for store: ${storeId}`);
            
            // Check if user already exists
            const existingUser = await UserRepository.findByEmail(data.email);
            if (existingUser) {
                return {
                    data: null,
                    message: 'Email sudah terdaftar',
                    success: false,
                    errorType: 'DUPLICATE'
                };
            }
            
            const userId = generateId();
            
            // Hash password
            const salt = this.generateSaltFromEmail(data.email);
            const hashedPassword = Hash.hash(data.password, salt);
            
            // Create user
            const userData: Omit<IUser, 'id' | 'type' | 'createdAt' | 'updatedAt'> & { id: string } = {
                id: userId,
                email: data.email,
                password: hashedPassword,
                role: 'user',
                isEmployee: true,
                userDetails: {
                    name: data.name,
                },
            };
            
            await UserRepository.create(userData);
            
            // Create employee record
            const employeeData: Omit<IEmployee, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                userId,
                storeId,
                baseSalary: data.baseSalary || 0,
            };
            
            const employee = await EmployeeRepository.create(employeeData);
            const created = employee as (IEmployee & { id: string });
            
            logger.info(`Employee registered successfully - ID: ${created.id}, User ID: ${userId}`);
            
            return {
                data: created,
                message: 'Karyawan berhasil ditambahkan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to register employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to register employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get all employees for a store
     */
    static async getEmployeesByStoreId(storeId: string, page: number = 1, limit: number = 10): Promise<EmployeesResult> {
        try {
            const allEmployees = await EmployeeRepository.findByStoreId(storeId);
            const total = allEmployees.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            
            const employees = allEmployees.slice(skip, skip + limit) as (IEmployee & { id: string })[];
            
            return {
                data: {
                    employees,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: 'Daftar karyawan berhasil ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get employees: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Remove employee
     */
    static async removeEmployee(employeeId: string): Promise<EmployeeResult> {
        try {
            const existing = await EmployeeRepository.findById(employeeId);
            
            if (!existing) {
                return {
                    data: null,
                    message: 'Employee not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            // Remove employee record (user remains but is no longer an employee)
            await EmployeeRepository.delete(employeeId);
            
            // Update user to not be an employee
            await UserRepository.update(existing.userId, { isEmployee: false });
            
            return {
                data: existing as (IEmployee & { id: string }),
                message: 'Karyawan berhasil dihapus',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to remove employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to remove employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Clock in (Check-in with geo-location and face capture)
     */
    static async checkIn(
        employeeId: string,
        latitude?: number,
        longitude?: number,
        imageUrl?: string
    ): Promise<AttendanceResult> {
        try {
            logger.info(`Employee ${employeeId} checking in`);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if already checked in today
            // Note: date should be handled carefully. Assuming Repository handles exact match or we filter
            // AttendanceRepository.findByEmployeeAndDate uses exact match locally? No, query uses =.
            // We need to pass standardized date string if using query.
            // Or just fetch all today and check.
            
            const allAttendance = await AttendanceRepository.findByEmployeeId(employeeId);
            const todayAttendance = (allAttendance as (IAttendance & { id: string })[]).find(att => {
                const attDate = new Date(att.date);
                attDate.setHours(0, 0, 0, 0);
                return attDate.getTime() === today.getTime();
            });
            
            if (todayAttendance && todayAttendance.checkInTime) {
                return {
                    data: todayAttendance,
                    message: 'Anda sudah absen masuk hari ini',
                    success: false,
                    errorType: 'DUPLICATE'
                };
            }
            
            // Determine status based on time (simple logic: after 09:00 is late)
            const now = new Date();
            const hour = now.getHours();
            let status: AttendanceStatus = 'present';
            if (hour >= 9) {
                status = 'late';
            }
            
            const attendanceData: Omit<IAttendance, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                employeeId,
                date: today.toISOString(),
                status,
                checkInTime: now.toISOString(),
                latitude,
                longitude,
                imageUrl,
            };
            
            const attendance = await AttendanceRepository.create(attendanceData);
            const created = attendance as (IAttendance & { id: string });
            
            logger.info(`Check-in successful for employee ${employeeId} at ${now.toISOString()}`);
            
            return {
                data: created,
                message: `Absen masuk berhasil (${status === 'late' ? 'Terlambat' : 'Tepat waktu'})`,
                success: true
            };
            
        } catch (error) {
            logger.error(`Check-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Check-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Clock out (Check-out)
     */
    static async checkOut(employeeId: string): Promise<AttendanceResult> {
        try {
            logger.info(`Employee ${employeeId} checking out`);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Find today's attendance
            const allAttendance = await AttendanceRepository.findByEmployeeId(employeeId);
            const todayAttendance = (allAttendance as (IAttendance & { id: string })[]).find(att => {
                const attDate = new Date(att.date);
                attDate.setHours(0, 0, 0, 0);
                return attDate.getTime() === today.getTime();
            });
            
            if (!todayAttendance) {
                return {
                    data: null,
                    message: 'Anda belum absen masuk hari ini',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            if (todayAttendance.checkOutTime) {
                return {
                    data: todayAttendance,
                    message: 'Anda sudah absen pulang hari ini',
                    success: false,
                    errorType: 'DUPLICATE'
                };
            }
            
            const now = new Date();
            await AttendanceRepository.update(todayAttendance.id, { checkOutTime: now.toISOString() });
            const updated = await AttendanceRepository.findById(todayAttendance.id) as (IAttendance & { id: string });
            
            logger.info(`Check-out successful for employee ${employeeId} at ${now.toISOString()}`);
            
            return {
                data: updated,
                message: 'Absen pulang berhasil',
                success: true
            };
            
        } catch (error) {
            logger.error(`Check-out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Check-out failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get attendance history for an employee
     */
    static async getAttendanceHistory(employeeId: string, page: number = 1, limit: number = 30): Promise<{
        data: { attendances: (IAttendance & { id: string })[]; pagination: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number; } } | null;
        message: string;
        success: boolean;
    }> {
        try {
            const all = await AttendanceRepository.findByEmployeeId(employeeId);
            const total = all.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            
            const attendances = all.slice(skip, skip + limit) as (IAttendance & { id: string })[];
            
            return {
                data: {
                    attendances,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: 'Riwayat absensi berhasil ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get attendance: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false
            };
        }
    }
    
    /**
     * Generate payroll for an employee
     */
    static async generatePayroll(
        employeeId: string,
        periodStart: Date,
        periodEnd: Date,
        bonus?: number,
        deduction?: number
    ): Promise<PayrollResult> {
        try {
            logger.info(`Generating payroll for employee ${employeeId}`);
            
            const employee = await EmployeeRepository.findById(employeeId);
            
            if (!employee) {
                return {
                    data: null,
                    message: 'Employee not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            const amount = employee.baseSalary;
            const bonusAmount = bonus || 0;
            const deductionAmount = deduction || 0;
            const netAmount = amount + bonusAmount - deductionAmount;
            
            const payrollData: Omit<IPayroll, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                employeeId,
                periodStart: periodStart.toISOString(),
                periodEnd: periodEnd.toISOString(),
                amount,
                bonus: bonusAmount,
                deduction: deductionAmount,
                netAmount,
                status: 'draft',
            };
            
            const payroll = await PayrollRepository.create(payrollData);
            const created = payroll as (IPayroll & { id: string });
            
            logger.info(`Payroll generated - ID: ${created.id}, Net: ${netAmount}`);
            
            return {
                data: created,
                message: 'Slip gaji berhasil dibuat',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to generate payroll: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to generate payroll: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Update payroll status (e.g., mark as paid)
     */
    static async updatePayrollStatus(payrollId: string, status: PayrollStatus, paidDate?: Date): Promise<PayrollResult> {
        try {
            const existing = await PayrollRepository.findById(payrollId);
            
            if (!existing) {
                return {
                    data: null,
                    message: 'Payroll not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            const updateData: Partial<IPayroll> = { status };
            if (status === 'paid' && paidDate) {
                updateData.paidDate = paidDate.toISOString();
            }
            
            await PayrollRepository.update(payrollId, updateData);
            const updated = await PayrollRepository.findById(payrollId) as (IPayroll & { id: string });
            
            return {
                data: updated,
                message: 'Status gaji berhasil diperbarui',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to update payroll: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to update payroll: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get payroll history for an employee
     */
    static async getPayrollHistory(employeeId: string): Promise<{
        data: (IPayroll & { id: string })[] | null;
        message: string;
        success: boolean;
    }> {
        try {
            const result = await PayrollRepository.findByEmployeeId(employeeId);
            
            return {
                data: result as (IPayroll & { id: string })[],
                message: 'Riwayat gaji berhasil ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get payroll history: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get payroll history: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false
            };
        }
    }
}
