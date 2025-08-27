export interface iUser {
    id?: string;
    email?: string;
    role?: string | null;
    subscriptionType?: string | null;
    UserDetails? : {
        name: string | null;
        imageProfile?: string | null;
        phoneNumber?: string | null;
        address?: string | null;
    } | null;
    isEmployee?: boolean | null;
}



export enum AuthErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    CONFLICT = 'CONFLICT',
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',
    TIMEOUT = 'TIMEOUT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    FOREIGN_KEY_ERROR = 'FOREIGN_KEY_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS'
}


export interface AuthError {
    data: null;
    message: string;
    success: false;
    errorType: AuthErrorType;
}

export interface AuthLoginSuccess {
    data: {
        id: string;
        email: string;
        password: string;
        role: string | null;
        subscriptionType: string | null;
        isEmployee: boolean | null;
        UserDetails: {
            name: string | null;
            imageProfile: string | null;
            phoneNumber: string | null;
            address: string | null;
        } | null;
    };
    message: string;
    token: string | null;
    success: true;
}


export interface AuthRegisterSuccess {
    data: {
        id: string;
        email: string;
        password: string;
        role: string | null;
        subscriptionType: string | null;
        isEmployee: boolean | null;
        UserDetails: {
            name: string | null;
            imageProfile: string | null;
            phoneNumber: string | null;
            address: string | null;
        } | null;
    };
    message: string;
    token: string;
    success: true;
}


export type AuthLoginResult = AuthLoginSuccess | AuthError;
export type AuthRegisterResult = AuthRegisterSuccess | AuthError;