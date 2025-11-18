# Unified Authentication Middleware

## Overview

The unified authentication middleware combines the functionality of both `jwtMiddleware` and `webAuthMiddleware` into a single, flexible solution that can handle authentication from both Authorization headers and HTTP-only cookies.

## How It Works

The middleware follows this priority order when looking for authentication tokens:

1. **Authorization Header (Bearer Token)**: First checks for a token in the `Authorization` header with the format `Bearer <token>`
2. **HTTP-only Cookie**: If no token is found in the header, it checks for a cookie named `transellia_token`

## Usage

### Required Authentication

For routes that require authentication, use the `unifiedAuthMiddleware`:

```typescript
import { unifiedAuthMiddleware } from '../middleware';

// Apply to a specific route
router.get('/protected', unifiedAuthMiddleware, controller.handler);

// Apply to all routes in a router
router.use(unifiedAuthMiddleware);
```

### Optional Authentication

For routes where authentication is optional but you want to capture user data when available, use the `optionalUnifiedAuthMiddleware`:

```typescript
import { optionalUnifiedAuthMiddleware } from '../middleware';

// Apply to a specific route
router.get('/optional', optionalUnifiedAuthMiddleware, controller.handler);
```

### Middleware Chains

You can combine the unified middleware with other middleware:

```typescript
import { unifiedAuthMiddleware } from '../middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

// Admin-only routes
router.use(unifiedAuthMiddleware, adminMiddleware);
```

## Migration from Previous Middleware

If you were previously using `jwtMiddleware` or `webAuthMiddleware`, simply replace them with `unifiedAuthMiddleware`:

```typescript
// Before
import { jwtMiddleware } from '../middleware';
import { webAuthMiddleware } from '../middleware/web-auth.middleware';

// After
import { unifiedAuthMiddleware } from '../middleware';
```

## Benefits

1. **Flexibility**: Works with both API clients (using Authorization headers) and web clients (using cookies)
2. **Simplified Code**: No need to maintain separate middleware for different authentication methods
3. **Consistent Behavior**: Same validation logic regardless of token source
4. **Better Logging**: Includes token source information in logs for debugging

## Cookie Configuration

For web clients using cookie-based authentication, ensure the cookie is named `transellia_token` and is set as HTTP-only for security.

## Error Handling

The middleware provides consistent error messages in Indonesian:
- Missing token: "Token akses wajib disertakan"
- Empty token: "Token tidak boleh kosong"
- Invalid/expired token: "Token tidak valid atau sudah kedaluwarsa"
- Invalid payload: "Token berisi data yang tidak valid"
- System error: "Terjadi kesalahan sistem saat validasi token"