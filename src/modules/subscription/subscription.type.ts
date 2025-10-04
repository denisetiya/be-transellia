import type { iUser } from '../auth/auth.type';

export interface iSubscription {
    id: string;
    name: string;
    price: number;
    description: string | null;
    features: string[];
    createdAt: Date;
    updatedAt: Date;
}

export enum SubscriptionErrorType {
    NOT_FOUND = 'NOT_FOUND',
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',
    TIMEOUT = 'TIMEOUT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface SubscriptionError {
    data: null;
    message: string;
    success: false;
    errorType: SubscriptionErrorType;
}

export interface SubscriptionSuccess {
    data: iSubscription;
    message: string;
    success: true;
}

export interface SubscriptionsSuccess {
    data: iSubscription[];
    message: string;
    success: true;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UsersBySubscriptionSuccess {
    data: iUser[];
    message: string;
    success: true;
}

export interface SubscriptionPaymentData {
    orderId?: string;
    paymentId?: string;
    subscriptionId: string;
    subscriptionName: string;
    amount: number;
    redirectUrl?: string;
    qrCode?: string;
    vaNumber?: string;
    expiryTime?: string;
}

export interface SubscriptionPaymentSuccess {
    data: SubscriptionPaymentData;
    message: string;
    success: true;
}

export interface SubscriptionPaymentError {
    data: null;
    message: string;
    success: false;
    errorType: string;
}

export type SubscriptionPaymentResult = SubscriptionPaymentSuccess | SubscriptionPaymentError;

export type SubscriptionResult = SubscriptionSuccess | SubscriptionError;
export type SubscriptionsResult = SubscriptionsSuccess | SubscriptionError;
export type UsersBySubscriptionResult = UsersBySubscriptionSuccess | SubscriptionError;