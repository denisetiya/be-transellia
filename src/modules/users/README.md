# Users Module

This module handles user management and operations within the application.

## Features

- Retrieve user information
- Complete CRUD operations for user management (Admin only)
- Manage user subscriptions
- Handle user authentication (in conjunction with the auth module)
- Comprehensive validation and error handling

## API Endpoints

### Public Routes (Authenticated Users)

#### Get Current User Profile
```
GET /users/me
```
Retrieve the authenticated user's profile information based on the JWT token.

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mendapatkan profil pengguna",
  "content": {
    "user": {
      "id": "string",
      "email": "string",
      "role": "string",
      "subscriptionId": "string",
      "subscription": {
        "id": "string",
        "name": "string",
        "price": "number",
        "description": "string",
        "features": ["string"],
        "createdAt": "date",
        "updatedAt": "date"
      },
      "UserDetails": {
        "name": "string",
        "imageProfile": "string",
        "phoneNumber": "string",
        "address": "string"
      },
      "isEmployee": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
}
```

### Admin Routes (Admin Privileges Required)

#### Get All Users
```
GET /users
```
Retrieve a list of all users with pagination (excludes admin users).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mendapatkan daftar pengguna",
  "content": {
    "users": [
      {
        "id": "string",
        "email": "string",
        "role": "string",
        "subscriptionId": "string",
        "UserDetails": {
          "name": "string",
          "imageProfile": "string",
          "phoneNumber": "string",
          "address": "string"
        },
        "isEmployee": "boolean",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  },
  "meta": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Get User by ID
```
GET /users/:id
```
Retrieve detailed information about a specific user.

**Path Parameters:**
- `id`: User ID

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mendapatkan detail pengguna",
  "content": {
    "user": {
      "id": "string",
      "email": "string",
      "role": "string",
      "subscriptionId": "string",
      "subscription": { ... },
      "UserDetails": { ... },
      "isEmployee": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
}
```

#### Create User
```
POST /users
```
Create a new user in the system.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "isEmployee": false,
  "userDetails": {
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "address": "123 Main St"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil membuat pengguna baru",
  "content": {
    "user": {
      "id": "string",
      "email": "string",
      "role": "string",
      "subscriptionId": null,
      "subscription": null,
      "UserDetails": {
        "name": "string",
        "phoneNumber": "string",
        "address": "string"
      },
      "isEmployee": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
}
```

#### Update User
```
PUT /users/:id
```
Update an existing user's information.

**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "email": "updated@example.com",
  "role": "user",
  "isEmployee": true,
  "subscriptionId": "subscription_id",
  "userDetails": {
    "name": "Jane Doe",
    "phoneNumber": "+0987654321",
    "address": "456 Oak Ave"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil memperbarui pengguna",
  "content": {
    "user": {
      "id": "string",
      "email": "string",
      "role": "string",
      "subscriptionId": "string",
      "subscription": { ... },
      "UserDetails": { ... },
      "isEmployee": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
}
```

#### Delete User
```
DELETE /users/:id
```
Delete a user from the system.

**Path Parameters:**
- `id`: User ID

**Note:** Admins cannot delete their own accounts.

**Response:**
```json
{
  "success": true,
  "message": "Berhasil menghapus pengguna",
  "content": null
}
```

#### Update User Subscription
```
PATCH /users/:id/subscription
```
Update or remove a user's subscription.

**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "subscriptionId": "new_subscription_id"
}
```

To remove subscription:
```json
{
  "subscriptionId": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil memperbarui langganan pengguna",
  "content": null
}
```

## Data Model

The user model includes the following fields:

- `id`: Unique identifier for the user
- `email`: User's email address (unique)
- `password`: Hashed password
- `role`: User role (e.g., "user", "ADMIN")
- `subscriptionId`: ID of the user's current subscription
- `isEmployee`: Boolean indicating if the user is an employee
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated

Related models:
- `UserDetails`: Additional user details (name, profile image, phone number, address)
- `subscription`: The user's current subscription

## Validation Rules

### Email
- Must be a valid email format
- Must be unique when creating or updating

### Password
- Minimum 6 characters

### Role
- Must be either "user" or "ADMIN"

### User Details
- Name is required when provided
- Phone number and address are optional

## Error Handling

The module provides comprehensive error handling for:
- Validation errors (400 Bad Request)
- Authentication errors (401 Unauthorized)
- Authorization errors (403 Forbidden)
- Not found errors (404 Not Found)
- Database errors (500 Internal Server Error)
- Internal server errors (500 Internal Server Error)

All errors are logged and returned in a consistent format with appropriate Indonesian error messages.

## Security Features

1. **Authentication**: All endpoints require authentication using the unified authentication middleware
2. **Authorization**: Admin-only operations are protected with role-based access control
3. **Password Security**: Passwords are hashed using a deterministic salt based on the user's email
4. **Self-Protection**: Admins cannot delete their own accounts
5. **Audit Logging**: All admin operations are logged for security and debugging
6. **Input Validation**: All inputs are validated using Zod schemas

## Database Operations

All database operations use:
- **Transactions**: For data consistency when multiple tables are involved
- **Connection Management**: Proper connection handling with automatic disconnection
- **Error Handling**: Comprehensive error handling with proper logging
- **Cascade Deletion**: Related records are automatically deleted when a user is deleted

## Documentation

For detailed API documentation including examples and error responses, see [USERS_CRUD_API.md](./USERS_CRUD_API.md).