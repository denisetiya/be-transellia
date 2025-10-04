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

export interface iUserDetails {
    id: string;
    email: string;
    role: string | null;
    subscriptionId: string | null;
    subscription: {
        id: string;
        name: string;
        price: number;
        currency: string;
        description: string | null;
        durationValue: number;
        durationUnit: string;
        features: string[];
        status: string;
        subscribersCount: number;
        totalRevenue: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
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
    data: null;
    message: string;
    success: true;
}

export type UserCreateResult = UserCreateSuccess | UserError;
export type UserUpdateResult = UserUpdateSuccess | UserError;
export type UserDeleteResult = UserDeleteSuccess | UserError;