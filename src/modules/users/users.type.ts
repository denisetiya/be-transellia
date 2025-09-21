import type { iUser } from '../auth/auth.type';

export interface iUserList {
    id: string;
    email: string;
    role: string | null;
    subscriptionId: string | null;
    UserDetails: {
        name: string | null;
        imageProfile: string | null;
        phoneNumber: string | null;
        address: string | null;
    } | null;
    isEmployee: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}

export enum UsersErrorType {
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',
    TIMEOUT = 'TIMEOUT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED'
}

export interface UsersError {
    data: null;
    message: string;
    success: false;
    errorType: UsersErrorType;
}

export interface UsersListSuccess {
    data: iUserList[];
    message: string;
    success: true;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type UsersListResult = UsersListSuccess | UsersError;