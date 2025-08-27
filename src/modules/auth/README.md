## Error Handling System

The project implements a centralized, modular error handling system for consistent error management across all modules.

### Auth Module Error Types

The authentication module (`src/modules/auth/auth.error.ts`) defines standardized error types for all authentication operations:

#### Error Type Definitions

| Error Type | Description | HTTP Status | Usage |
|------------|-------------|-------------|-------|
| `INVALID_CREDENTIALS` | Wrong email or password during login | 401 Unauthorized | Login failures |
| `CONFLICT` | General conflict errors | 409 Conflict | Data conflicts |
| `EMAIL_ALREADY_EXISTS` | Registration with existing email | 409 Conflict | Registration failures |
| `DATABASE_CONNECTION` | Database connectivity issues | 500 Internal Server Error | DB connection problems |
| `TIMEOUT` | Request timeout errors | 500 Internal Server Error | Operation timeouts |
| `INTERNAL_ERROR` | General system errors | 500 Internal Server Error | Unexpected system failures |
| `FOREIGN_KEY_ERROR` | Database foreign key constraint violations | 400 Bad Request | Data integrity issues |
| `VALIDATION_ERROR` | Input validation failures | 400 Bad Request | Invalid request data |
| `USER_NOT_FOUND` | User lookup failures | 401 Unauthorized | User not found scenarios |

#### Error Response Structure

**Error Response:**
```typescript
{
  data: null,
  message: string,
  success: false,
  errorType: AuthErrorType
}
```

**Success Response (Login):**
```typescript
{
  data: {
    id: string,
    email: string,
    role: string | null,
    subscriptionType: string | null,
    isEmployee: boolean | null,
    UserDetails: {
      name: string | null,
      imageProfile: string | null,
      phoneNumber: string | null,
      address: string | null
    } | null
  },
  message: string,
  token: string | null,
  success: true
}
```

#### Usage Examples

**Service Layer:**
```typescript
import AuthErrorHandler, { AuthErrorType } from './auth.error';

// Using pre-defined error templates
return AuthErrorHandler.errors.invalidCredentials(email);
return AuthErrorHandler.errors.emailAlreadyExists(email);

// Creating custom service errors
return AuthErrorHandler.createServiceError(
  AuthErrorType.VALIDATION_ERROR,
  'Custom validation message',
  email
);

// Handling database errors
return AuthErrorHandler.handleDatabaseError(error, email, 'login');
```

**Controller Layer:**
```typescript
import AuthErrorHandler from './auth.error';

// Handle service errors
if (!loginResult.success) {
  AuthErrorHandler.handleControllerServiceError(res, loginResult, email);
  return;
}

// Handle exceptions
catch (error) {
  AuthErrorHandler.handleControllerException(res, error, 'login', email);
  return;
}
```

#### Available Error Handler Methods

| Method | Purpose | Layer |
|--------|---------|-------|
| `createServiceError()` | Create standardized service errors | Service |
| `handleDatabaseError()` | Handle database-specific errors | Service |
| `handleControllerServiceError()` | Map service errors to HTTP responses | Controller |
| `handleControllerException()` | Handle unexpected exceptions | Controller |
| `errors.invalidCredentials()` | Pre-defined invalid credentials error | Service |
| `errors.emailAlreadyExists()` | Pre-defined email exists error | Service |
| `errors.userNotFound()` | Pre-defined user not found error | Service |
| `errors.validationError()` | Pre-defined validation error | Service |
| `errors.internalError()` | Pre-defined internal error | Service |

#### Error Logging

All errors are automatically logged with structured information:
- **Service Errors**: `logger.warn()` with email, error type, and message
- **Database Errors**: `logger.error()` with detailed error information
- **Controller Errors**: `logger.warn()` for service errors, `logger.error()` for exceptions
- **Development Mode**: Detailed error messages included in responses
- **Production Mode**: Generic error messages for security

### Adding New Error Types

To add new error types to the auth module:

1. **Add to AuthErrorType enum:**
```typescript
export enum AuthErrorType {
  // ... existing types
  NEW_ERROR_TYPE = 'NEW_ERROR_TYPE'
}
```

2. **Add to error handler switch statement:**
```typescript
case AuthErrorType.NEW_ERROR_TYPE:
  response.badRequest(res, message); // or appropriate response method
  break;
```

3. **Add pre-defined error template (optional):**
```typescript
static readonly errors = {
  // ... existing errors
  newErrorType: (email?: string) => 
    this.createServiceError(
      AuthErrorType.NEW_ERROR_TYPE,
      'Your error message here',
      email
    )
};
```