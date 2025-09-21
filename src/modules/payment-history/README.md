# Payment History Module

This module handles the tracking and management of payment histories for subscription payments.

## Features

- Track all subscription payments
- View payment histories for all users (admin only)
- View payment histories for specific users
- Update payment statuses based on Midtrans webhook notifications

## API Endpoints

### Public Routes (Authenticated Users)

#### Get Payment Histories by User ID
```
GET /payment-history/user/:userId
```
Retrieve payment histories for a specific user with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)

### Admin Routes

#### Get All Payment Histories
```
GET /payment-history
```
Retrieve all payment histories with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)

#### Get Payment History by ID
```
GET /payment-history/:id
```
Retrieve details of a specific payment history by its ID.

## Data Model

The payment history model includes the following fields:

- `id`: Unique identifier for the payment history record
- `userId`: ID of the user who made the payment
- `subscriptionId`: ID of the subscription being paid for
- `orderId`: Unique order ID for the payment
- `paymentId`: Payment ID from Midtrans (nullable)
- `amount`: Payment amount
- `currency`: Payment currency (e.g., "IDR")
- `paymentMethod`: Payment method used (e.g., "va", "qr", "wallet")
- `status`: Current status of the payment (e.g., "pending", "success", "failed")
- `transactionTime`: Time when the transaction was initiated
- `expiryTime`: Time when the payment expires (for VA and QR payments)
- `vaNumber`: Virtual account number (for VA payments)
- `bank`: Bank name (for VA payments)
- `qrCode`: QR code content (for QR payments)
- `redirectUrl`: Redirect URL (for wallet payments)
- `createdAt`: Timestamp when the record was created
- `updatedAt`: Timestamp when the record was last updated

## Integration

The payment history module is automatically integrated with:

1. **Subscription Payment Processing**: When a user pays for a subscription, a payment history record is created.
2. **Midtrans Webhooks**: When Midtrans sends payment status updates, the payment history record is updated accordingly.

## Error Handling

The module provides comprehensive error handling for:
- Validation errors
- Database errors
- Internal server errors

All errors are logged and returned in a consistent format.