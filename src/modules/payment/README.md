# Payment Module

This module handles payment processing using Midtrans for various payment methods including Virtual Account (VA), QR codes, and e-wallets.

## Features

- Virtual Account (VA) payments (BCA, BNI, Permata)
- QR code payments (GoPay)
- E-wallet payments (GoPay, OVO, DANA, LinkAja)
- Payment status checking

## API Endpoints

### Create Payment
```
POST /payments
```

**Request Body:**
```json
{
  "orderId": "string",
  "amount": "number",
  "currency": "string",
  "customer": {
    "id": "string",
    "email": "string",
    "firstName": "string (optional)",
    "lastName": "string (optional)",
    "phone": "string (optional)"
  },
  "paymentMethod": "va|qr|wallet",
  "bank": "string (required for VA payments)",
  "walletProvider": "string (required for wallet payments)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "orderId": "string",
    "paymentId": "string",
    "redirectUrl": "string (for wallet payments)",
    "qrCode": "string (for QR payments)",
    "vaNumber": "string (for VA payments)",
    "expiryTime": "string"
  }
}
```

### Get Payment Status
```
GET /payments/:orderId
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "orderId": "string",
    "paymentId": "string",
    "redirectUrl": "string (for wallet payments)",
    "qrCode": "string (for QR payments)",
    "vaNumber": "string (for VA payments)",
    "expiryTime": "string"
  }
}
```

## Payment Methods

### Virtual Account (VA)
Supported banks:
- BCA
- BNI
- Permata

### QR Code
- GoPay

### E-Wallets
- GoPay
- OVO
- DANA
- LinkAja

## Error Handling

The module provides comprehensive error handling for:
- Validation errors
- Midtrans API errors
- Database errors
- Internal server errors

All errors are logged and returned in a consistent format.