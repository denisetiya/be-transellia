# Auth Error Handling Documentation

## Overview

Sistem error handling untuk auth module telah diperbaharui dengan fitur-fitur berikut:

## Fitur Utama

### 1. Comprehensive Error Handling
- **Try-catch blocks** di semua method controller dan service
- **Structured error responses** dengan format yang konsisten
- **Detailed logging** untuk debugging dan monitoring
- **Custom error types** untuk berbagai jenis error

### 2. Custom Error Classes

#### AuthServiceError
Custom error class dengan tipe-tipe error yang spesifik:

```typescript
// Contoh penggunaan
throw AuthServiceError.invalidCredentials("Email atau password salah");
throw AuthServiceError.emailAlreadyExists("Email sudah terdaftar");
```

#### Error Types:
- `INVALID_CREDENTIALS` - Email/password salah
- `USER_NOT_FOUND` - User tidak ditemukan  
- `EMAIL_ALREADY_EXISTS` - Email sudah terdaftar
- `WEAK_PASSWORD` - Password terlalu lemah
- `INVALID_TOKEN` - Token tidak valid
- `TOKEN_EXPIRED` - Token kadaluarsa
- `DATABASE_CONNECTION` - Masalah koneksi database
- `TIMEOUT` - Request timeout
- `FOREIGN_KEY_ERROR` - Error foreign key constraint
- `INTERNAL_ERROR` - Error sistem internal
- `VALIDATION_ERROR` - Error validasi input

### 3. Middleware Error Handling

#### AuthMiddleware.errorHandler
Global error handler yang menangani:
- **Custom AuthServiceError**
- **Prisma database errors** 
- **JWT token errors**
- **Zod validation errors**
- **Generic JavaScript errors**

#### AuthMiddleware.validateToken
Middleware untuk validasi JWT token pada protected routes.

#### AuthMiddleware.requireRole
Middleware untuk membatasi akses berdasarkan role user.

#### AuthMiddleware.requireEmployee  
Middleware untuk membatasi akses khusus employee.

#### AuthMiddleware.rateLimitAuth
Rate limiting untuk mencegah brute force attacks.

### 4. Enhanced Logging

Semua error dan aktivitas penting di-log dengan format:
```
[timestamp] [LEVEL] [App] message
```

**Log Levels:**
- `INFO` - Aktivitas normal (login success, registration, dll)
- `WARN` - Peringatan (failed login attempts, validation errors)
- `ERROR` - Error yang memerlukan perhatian

### 5. Input Validation

**Zod Schema Validation** untuk:
- Email format validation
- Password strength requirements  
- Required field validation
- Data type validation

## Penggunaan

### Basic Router Setup
```typescript
import authRouter from './modules/auth/auth.router';
app.use('/api/auth', authRouter);
```

### Protected Routes Example
```typescript
// Setelah middleware diaktifkan kembali
app.get('/profile', 
  AuthMiddleware.validateToken, 
  UserController.getProfile
);

app.get('/admin/users',
  AuthMiddleware.validateToken,
  AuthMiddleware.requireRole(['ADMIN']),
  AdminController.getUsers  
);
```

### Error Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

**Error Response:**
```json
{
  "success": false, 
  "message": "Email atau password salah",
  "errorDetail": "Additional error info (optional)"
}
```

## API Endpoints

### POST /login
Login user dengan email dan password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /register  
Registrasi user baru.

**Request Body:**
```json
{
  "email": "user@example.com", 
  "password": "password123",
  "name": "User Name"
}
```

## Database Error Handling

**Prisma Error Codes yang ditangani:**
- `P2002` - Unique constraint violation
- `P2025` - Record not found
- `P2003` - Foreign key constraint violation  
- `P1001` - Database connection error

## Security Features

1. **Rate Limiting** - Maksimal 5 percobaan login per 15 menit per IP
2. **Password Hashing** - Menggunakan custom hash algorithm
3. **JWT Tokens** - Untuk authentication dengan expiry
4. **Input Sanitization** - Validasi dan sanitasi input
5. **Error Message Obfuscation** - Tidak mengekspos informasi sensitif

## Monitoring & Debugging

**Log files mencatat:**
- User login/registration attempts
- Failed authentication attempts  
- Database connection issues
- Validation errors
- System errors dengan stack traces (dev mode)

**Environment Variables:**
- `NODE_ENV=development` - Menampilkan detail error di response
- `NODE_ENV=production` - Menyembunyikan detail error internal

## Next Steps

1. **Middleware Integration** - Uncomment middleware di router setelah testing
2. **Rate Limiting** - Aktifkan rate limiting di production
3. **Logging Service** - Integrasi dengan external logging service
4. **Monitoring** - Setup alerting untuk critical errors
5. **Testing** - Buat unit tests untuk error scenarios