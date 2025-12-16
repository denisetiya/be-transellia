
// Enums as string literals for Mongoose
export type Role = 'user' | 'admin';
export type Status = 'active' | 'inactive' | 'pending';
export type DurationUnit = 'days' | 'weeks' | 'months' | 'years';
export type PaymentMethod = 'va' | 'qr' | 'wallet' | 'credit_card';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'sick';
export type PayrollStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

// Enum values for Mongoose schema validation
export const RoleValues = ['user', 'admin'] as const;
export const StatusValues = ['active', 'inactive', 'pending'] as const;
export const DurationUnitValues = ['days', 'weeks', 'months', 'years'] as const;
export const PaymentMethodValues = ['va', 'qr', 'wallet', 'credit_card'] as const;
export const PaymentStatusValues = ['pending', 'success', 'failed', 'expired'] as const;
export const AttendanceStatusValues = ['present', 'absent', 'late', 'sick'] as const;
export const PayrollStatusValues = ['draft', 'pending', 'paid', 'cancelled'] as const;
