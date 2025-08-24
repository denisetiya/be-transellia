export enum AuthErrorTypes {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    INVALID_TOKEN = 'INVALID_TOKEN',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',
    TIMEOUT = 'TIMEOUT',
    FOREIGN_KEY_ERROR = 'FOREIGN_KEY_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface AuthError {
    type: AuthErrorTypes;
    message: string;
    details?: unknown;
    statusCode: number;
}

export class AuthServiceError extends Error {
    public readonly type: AuthErrorTypes;
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(type: AuthErrorTypes, message: string, statusCode: number = 400, details?: unknown) {
        super(message);
        this.name = 'AuthServiceError';
        this.type = type;
        this.statusCode = statusCode;
        this.details = details;
    }

    static invalidCredentials(message: string = "Email atau password salah"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.INVALID_CREDENTIALS,
            message,
            401
        );
    }

    static userNotFound(message: string = "User tidak ditemukan"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.USER_NOT_FOUND,
            message,
            404
        );
    }

    static emailAlreadyExists(message: string = "Email sudah terdaftar"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.EMAIL_ALREADY_EXISTS,
            message,
            409
        );
    }

    static weakPassword(message: string = "Password terlalu lemah"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.WEAK_PASSWORD,
            message,
            400
        );
    }

    static invalidToken(message: string = "Token tidak valid"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.INVALID_TOKEN,
            message,
            401
        );
    }

    static tokenExpired(message: string = "Token sudah kadaluarsa"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.TOKEN_EXPIRED,
            message,
            401
        );
    }

    static databaseConnection(message: string = "Koneksi database bermasalah"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.DATABASE_CONNECTION,
            message,
            503
        );
    }

    static timeout(message: string = "Request timeout"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.TIMEOUT,
            message,
            408
        );
    }

    static foreignKeyError(message: string = "Data referensi tidak valid"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.FOREIGN_KEY_ERROR,
            message,
            400
        );
    }

    static internalError(message: string = "Terjadi kesalahan sistem"): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.INTERNAL_ERROR,
            message,
            500
        );
    }

    static validationError(message: string, details?: unknown): AuthServiceError {
        return new AuthServiceError(
            AuthErrorTypes.VALIDATION_ERROR,
            message,
            400,
            details
        );
    }
}

export const AuthErrorMessages = {
    [AuthErrorTypes.INVALID_CREDENTIALS]: "Email atau password salah. Silakan coba lagi.",
    [AuthErrorTypes.USER_NOT_FOUND]: "User tidak ditemukan.",
    [AuthErrorTypes.EMAIL_ALREADY_EXISTS]: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
    [AuthErrorTypes.WEAK_PASSWORD]: "Password harus memiliki minimal 6 karakter.",
    [AuthErrorTypes.INVALID_TOKEN]: "Token tidak valid. Silakan login ulang.",
    [AuthErrorTypes.TOKEN_EXPIRED]: "Sesi sudah berakhir. Silakan login ulang.",
    [AuthErrorTypes.DATABASE_CONNECTION]: "Koneksi database bermasalah. Silakan coba lagi.",
    [AuthErrorTypes.TIMEOUT]: "Request timeout. Silakan coba lagi.",
    [AuthErrorTypes.FOREIGN_KEY_ERROR]: "Data referensi tidak valid. Silakan coba lagi.",
    [AuthErrorTypes.INTERNAL_ERROR]: "Terjadi kesalahan sistem. Silakan coba lagi.",
    [AuthErrorTypes.VALIDATION_ERROR]: "Data yang dikirim tidak valid."
};