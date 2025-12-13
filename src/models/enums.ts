
// Enums as string literals (Ottoman doesn't have native enum support like Prisma, so we use string validation)
export type Role = 'user' | 'admin';
export type Status = 'active' | 'inactive' | 'pending';
export type DurationUnit = 'days' | 'weeks' | 'months' | 'years';
export type PaymentMethod = 'va' | 'qr' | 'wallet' | 'credit_card';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'sick';
export type PayrollStatus = 'draft' | 'pending' | 'paid' | 'cancelled';
