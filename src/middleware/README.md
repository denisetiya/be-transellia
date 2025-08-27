# Middleware Documentation

## Overview
Middleware collection untuk authentication dan authorization di aplikasi be-transellia yang mendukung:
- **API Key Middleware**: Validasi API key dari header request
- **JWT Middleware**: Verifikasi dan decode JWT token, set user data ke `req.user`
- **Combined Middleware**: Kombinasi API key + JWT untuk berbagai skenario

## Setup Environment Variables

Pastikan environment variables berikut sudah dikonfigurasi di file `.env`:

```env
# API Key Configuration
API_KEY_DEV="transellia-api-key-development-2024"
API_KEY="transellia-api-key-production-2024"

# JWT Configuration
JWT_SECRET_DEV="your-super-secret-jwt-key-for-development-2024"
JWT_SECRET="your-super-secret-jwt-key-for-production-2024"
```

## Available Middleware

### 1. API Key Middleware (`apiKeyMiddleware`)

Validasi API key dari header request.

**Headers yang didukung:**
- `x-api-key`
- `api-key`
- `X-API-KEY`
- `API-KEY`

**Usage:**
```typescript
import { apiKeyMiddleware } from '../middleware';

router.get('/public-data', apiKeyMiddleware, (req, res) => {
    res.json({ message: 'Data accessed with API key' });
});
```

### 2. JWT Middleware (`jwtMiddleware`)

Verifikasi JWT token dan set user data ke `req.user`.

**Header format:**
```
Authorization: Bearer <jwt-token>
```

**Usage:**
```typescript
import { jwtMiddleware, type AuthenticatedRequest } from '../middleware';

router.get('/profile', jwtMiddleware, (req: AuthenticatedRequest, res) => {
    // req.user dijamin ada dan bertipe iUser
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.UserDetails?.name
        }
    });
});
```

### 3. Optional JWT Middleware (`optionalJwtMiddleware`)

JWT middleware yang tidak memblokir request jika token tidak ada.

**Usage:**
```typescript
import { optionalJwtMiddleware } from '../middleware';

router.get('/mixed-content', optionalJwtMiddleware, (req, res) => {
    if (req.user) {
        res.json({ message: 'Authenticated user content', user: req.user.email });
    } else {
        res.json({ message: 'Public content' });
    }
});
```

### 4. Combined Middleware

#### `authenticatedMiddleware`
API key + JWT (keduanya wajib)

```typescript
import { authenticatedMiddleware, type AuthenticatedRequest } from '../middleware';

router.get('/protected', authenticatedMiddleware, (req: AuthenticatedRequest, res) => {
    // Sudah melalui validasi API key dan JWT
    res.json({ 
        message: 'Fully protected endpoint',
        user: req.user.email 
    });
});
```

#### `apiWithOptionalAuthMiddleware`
API key wajib + JWT opsional

```typescript
import { apiWithOptionalAuthMiddleware } from '../middleware';

router.get('/semi-protected', apiWithOptionalAuthMiddleware, (req, res) => {
    const response = { message: 'API key validated' };
    
    if (req.user) {
        (response as any).userInfo = req.user.email;
    }
    
    res.json(response);
});
```

## Type Safety

### AuthenticatedRequest
Gunakan interface `AuthenticatedRequest` untuk route yang menggunakan `jwtMiddleware`:

```typescript
import type { AuthenticatedRequest } from '../middleware';

router.post('/create-item', jwtMiddleware, (req: AuthenticatedRequest, res) => {
    // req.user dijamin ada
    const userId = req.user.id;
    const userEmail = req.user.email;
    // ...
});
```

### Regular Request
Untuk route dengan `optionalJwtMiddleware`, gunakan type guard:

```typescript
router.get('/optional-auth', optionalJwtMiddleware, (req, res) => {
    if (req.user) {
        // TypeScript tahu req.user ada di sini
        console.log(req.user.email);
    }
});
```

## Error Handling

Semua middleware menggunakan response helper yang konsisten:

### API Key Errors:
- **400 Bad Request**: Format API key tidak valid
- **401 Unauthorized**: API key tidak valid atau tidak ada
- **500 Internal Server Error**: Error sistem

### JWT Errors:
- **401 Unauthorized**: Token tidak ada, tidak valid, atau expired
- **500 Internal Server Error**: Error sistem

## Implementation Examples

### Basic Authentication Endpoint
```typescript
import express from 'express';
import { jwtMiddleware, type AuthenticatedRequest } from '../middleware';

const router = express.Router();

router.get('/me', jwtMiddleware, (req: AuthenticatedRequest, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            name: req.user.UserDetails?.name,
            isEmployee: req.user.isEmployee
        }
    });
});

export default router;
```

### API with Role-based Access
```typescript
import { authenticatedMiddleware, type AuthenticatedRequest } from '../middleware';

router.post('/admin-action', authenticatedMiddleware, (req: AuthenticatedRequest, res) => {
    // Additional role validation
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Hanya admin yang diizinkan'
        });
    }

    // Admin logic here
    res.json({ success: true, message: 'Admin action completed' });
});
```

### Public API with Optional Auth
```typescript
import { apiWithOptionalAuthMiddleware } from '../middleware';

router.get('/public-data', apiWithOptionalAuthMiddleware, (req, res) => {
    const baseData = {
        publicInfo: 'Data yang bisa diakses semua orang',
        timestamp: new Date().toISOString()
    };

    if (req.user) {
        // Add personalized data for authenticated users
        (baseData as any).personalizedContent = `Hello ${req.user.UserDetails?.name || req.user.email}!`;
        (baseData as any).userPreferences = 'Some user-specific data';
    }

    res.json({
        success: true,
        data: baseData
    });
});
```

## Security Considerations

1. **API Key Storage**: Simpan API key dengan aman dan gunakan environment variables
2. **JWT Secret**: Gunakan secret yang kuat dan berbeda untuk development/production
3. **Token Expiration**: JWT token memiliki expiration time (default: 24 jam)
4. **Logging**: Semua attempt authentication dicatat untuk monitoring
5. **IP Logging**: Request IP address dicatat untuk security audit

## Troubleshooting

### Common Issues:

1. **"JWT_SECRET is not configured"**
   - Pastikan environment variable `JWT_SECRET_DEV` atau `JWT_SECRET` sudah diset

2. **"API key tidak valid"**
   - Periksa environment variable `API_KEY_DEV` atau `API_KEY`
   - Pastikan header menggunakan nama yang benar: `x-api-key`

3. **"Property 'user' does not exist on type 'Request'"**
   - Import middleware types: `import '../middleware/middleware.types'`
   - Atau gunakan `AuthenticatedRequest` type

4. **Token expired errors**
   - Token JWT memiliki expiration 24 jam
   - User perlu login ulang untuk mendapatkan token baru

## Development Tips

1. **Testing**: Gunakan tools seperti Postman atau curl untuk test API
2. **Debugging**: Cek logs untuk melihat authentication attempts
3. **Type Safety**: Selalu gunakan `AuthenticatedRequest` untuk route yang butuh user data
4. **Middleware Order**: API key middleware sebaiknya dipanggil sebelum JWT middleware