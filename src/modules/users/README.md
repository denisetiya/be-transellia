# Users Module

This module handles user management and operations within the application.

## Features

- Retrieve user information
- Manage user subscriptions
- Handle user authentication (in conjunction with the auth module)

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
  "data": {
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

### Admin Routes

#### Get All Users
```
GET /users
```
Retrieve a list of all users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mendapatkan daftar pengguna",
  "data": {
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

## Data Model

The user model includes the following fields:

- `id`: Unique identifier for the user
- `email`: User's email address (unique)
- `password`: Hashed password
- `role`: User role (e.g., "user", "admin")
- `subscriptionId`: ID of the user's current subscription
- `isEmployee`: Boolean indicating if the user is an employee
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated

Related models:
- `UserDetails`: Additional user details (name, profile image, phone number, address)
- `subscription`: The user's current subscription

## Error Handling

The module provides comprehensive error handling for:
- Validation errors
- Database errors
- Authentication errors
- Internal server errors

All errors are logged and returned in a consistent format.