export interface iUserList {
    id: string;
    email: string;
    role: string | null;
    subscriptionId: string | null;
    userDetails: {
        name?: string;
        imageProfile?: string;
        phoneNumber?: string;
        address?: string;
    } | null;
    isEmployee: boolean | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface iUserDetails {
    id: string;
    email: string;
    role: string | null;
    subscriptionId: string | null;
    subscription?: {
        id: string;
        name: string;
        price: number;
        currency: string;
        description?: string;
        durationValue: number;
        durationUnit: string;
        features: string[];
        status: string;
        subscribersCount: number;
        totalRevenue: number;
        createdAt?: Date;
        updatedAt?: Date;
    } | null;
    userDetails: {
        name?: string;
        imageProfile?: string;
        phoneNumber?: string;
        address?: string;
    } | null;
    isEmployee: boolean | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export enum UsersErrorType {
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',
    TIMEOUT = 'TIMEOUT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS'
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

// Result types for CRUD operations
export interface UserSuccess {
    data: iUserDetails;
    message: string;
    success: true;
}

export interface UserError {
    data: null;
    message: string;
    success: false;
    errorType: UsersErrorType;
}

export type UserResult = UserSuccess | UserError;

export interface UserCreateSuccess {
    data: iUserDetails;
    message: string;
    success: true;
}

export interface UserUpdateSuccess {
    data: iUserDetails;
    message: string;
    success: true;
}

export interface UserDeleteSuccess {
    data: { id: string } | null;
    message: string;
    success: true;
}

export type UserCreateResult = UserCreateSuccess | UserError;
export type UserUpdateResult = UserUpdateSuccess | UserError;
export type UserDeleteResult = UserDeleteSuccess | UserError;