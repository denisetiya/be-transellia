## Subscription Module

The subscription module handles all subscription-related operations including creating, reading, updating, and deleting subscription plans.

### Subscription Module Error Types

The subscription module (`src/modules/subscribtion/subscribtion.error.ts`) defines standardized error types for all subscription operations:

#### Error Type Definitions

| Error Type | Description | HTTP Status | Usage |
|------------|-------------|-------------|-------|
| `NOT_FOUND` | Subscription not found | 404 Not Found | Lookup failures |
| `DATABASE_CONNECTION` | Database connectivity issues | 500 Internal Server Error | DB connection problems |
| `TIMEOUT` | Request timeout errors | 500 Internal Server Error | Operation timeouts |
| `INTERNAL_ERROR` | General system errors | 500 Internal Server Error | Unexpected system failures |
| `VALIDATION_ERROR` | Input validation failures | 400 Bad Request | Invalid request data |

#### Error Response Structure

**Error Response:**
```typescript
{
  data: null,
  message: string,
  success: false,
  errorType: SubscriptionErrorType
}
```

**Success Response (Single Subscription):**
```typescript
{
  data: {
    id: string,
    name: string,
    price: number,
    description: string | null,
    features: string[],
    createdAt: Date,
    updatedAt: Date
  },
  message: string,
  success: true
}
```

**Success Response (Multiple Subscriptions):**
```typescript
{
  data: [
    {
      id: string,
      name: string,
      price: number,
      description: string | null,
      features: string[],
      createdAt: Date,
      updatedAt: Date
    }
  ],
  message: string,
  success: true
}
```

#### Usage Examples

**Service Layer:**
```typescript
import SubscriptionErrorHandler, { SubscriptionErrorType } from './subscribtion.error';

// Using pre-defined error templates
return SubscriptionErrorHandler.errors.notFound(id);
return SubscriptionErrorHandler.errors.validationError('Custom validation message');

// Creating custom service errors
return SubscriptionErrorHandler.createServiceError(
  SubscriptionErrorType.VALIDATION_ERROR,
  'Custom validation message',
 id
);

// Handling database errors
return SubscriptionErrorHandler.handleDatabaseError(error, 'operation name');
```

**Controller Layer:**
```typescript
import SubscriptionErrorHandler from './subscribtion.error';

// Handle service errors
if (!subscriptionResult.success) {
  // Handle based on error type
  switch (subscriptionResult.errorType) {
    case 'NOT_FOUND':
      return response.notFound(res, subscriptionResult.message);
    default:
      return response.internalServerError(res, subscriptionResult.message);
  }
}

// Handle exceptions
catch (error) {
  logger.error(`Unexpected error in subscription operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  return response.internalServerError(res, "Terjadi kesalahan sistem. Silakan coba lagi.");
}
```

#### Available Error Handler Methods

| Method | Purpose | Layer |
|--------|---------|-------|
| `createServiceError()` | Create standardized service errors | Service |
| `handleDatabaseError()` | Handle database-specific errors | Service |
| `errors.notFound()` | Pre-defined not found error | Service |
| `errors.validationError()` | Pre-defined validation error | Service |
| `errors.internalError()` | Pre-defined internal error | Service |

#### Error Logging

All errors are automatically logged with structured information:
- **Service Errors**: `logger.warn()` with ID, error type, and message
- **Database Errors**: `logger.error()` with detailed error information
- **Controller Errors**: `logger.warn()` for service errors, `logger.error()` for exceptions
- **Development Mode**: Detailed error messages included in responses
- **Production Mode**: Generic error messages for security

### Adding New Error Types

To add new error types to the subscription module:

1. **Add to SubscriptionErrorType enum:**
```typescript
export enum SubscriptionErrorType {
  // ... existing types
  NEW_ERROR_TYPE = 'NEW_ERROR_TYPE'
}
```

2. **Add to error handler switch statement in controller:**
```typescript
case 'NEW_ERROR_TYPE':
  response.badRequest(res, message); // or appropriate response method
  break;
```

3. **Add pre-defined error template (optional):**
```typescript
static readonly errors = {
 // ... existing errors
  newErrorType: (id?: string) => 
    this.createServiceError(
      SubscriptionErrorType.NEW_ERROR_TYPE,
      'Your error message here',
      id
    )
};
```

### API Endpoints

#### Get All Subscriptions
- **URL**: `GET /subscriptions`
- **Description**: Retrieve all subscription plans with pagination
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Number of items per page (default: 10, max: 100)
- **Response**: Array of subscription objects with pagination metadata
```json
{
  "success": true,
  "message": "Berhasil mendapatkan daftar subscription",
  "data": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "description": "string | null",
      "features": "string[]",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "meta": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Get Users by Subscription ID
- **URL**: `GET /subscriptions/:id/users`
- **Description**: Retrieve all users with a specific subscription plan
- **Path Parameters**:
  - `id`: Subscription ID
- **Response**: Array of user objects
```json
{
  "success": true,
  "message": "Berhasil mendapatkan pengguna dengan subscription ID: [id]",
  "data": [
    {
      "id": "string",
      "email": "string",
      "role": "string | null",
      "subscriptionId": "string | null",
      "UserDetails": {
        "name": "string | null",
        "imageProfile": "string | null",
        "phoneNumber": "string | null",
        "address": "string | null"
      } | null,
      "isEmployee": "boolean | null"
    }
  ]
}
```

#### Get Subscription by ID
- **URL**: `GET /subscriptions/:id`
- **Description**: Retrieve a specific subscription plan by ID
- **Response**: Single subscription object

#### Create Subscription
- **URL**: `POST /subscriptions`
- **Description**: Create a new subscription plan
- **Request Body**: 
  ```json
  {
    "name": "string",
    "price": "number",
    "description": "string (optional)",
    "features": "string[]"
  }
  ```
- **Response**: Created subscription object

#### Update Subscription
- **URL**: `PUT /subscriptions/:id`
- **Description**: Update an existing subscription plan
- **Request Body**: 
  ```json
  {
    "name": "string (optional)",
    "price": "number (optional)",
    "description": "string (optional)",
    "features": "string[] (optional)"
  }
  ```
- **Response**: Updated subscription object

#### Delete Subscription
- **URL**: `DELETE /subscriptions/:id`
- **Description**: Delete a subscription plan
- **Response**: Deleted subscription object