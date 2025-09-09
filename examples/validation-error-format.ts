/**
 * Example of the new Zod error response format
 * This shows how validation errors will be returned to the frontend
 */
/**
 * This file demonstrates how to handle validation errors with the global error handler
 */

import { z } from 'zod';
import GlobalErrorHandler from '../src/lib/lib.error.handler';

// Example user schema
const userSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  age: z.number().min(18, { message: "Must be at least 18 years old" }),
  name: z.string().min(1, { message: "Name is required" })
});

// Example of validating data
const userData = {
  email: "invalid-email",
  password: "123",
  age: 15,
  name: ""
};

try {
  // This will throw a ZodError
  userSchema.parse(userData);
  console.log("Validation passed");
} catch (error) {
  // Handle Zod validation error with global error handler
  if (error instanceof z.ZodError) {
    const globalError = GlobalErrorHandler.handleZodError(error);
    console.log("Global Error Response:", JSON.stringify(globalError, null, 2));
    
    // In a real Express app, you would send this error response:
    // GlobalErrorHandler.handleHTTPError(res, globalError);
  }
}

// Example of field-specific validation
const emailSchema = z.string().email();
try {
  emailSchema.parse("invalid-email");
} catch (error) {
  if (error instanceof z.ZodError) {
    const globalError = GlobalErrorHandler.handleZodError(error, "email");
    console.log("Email Validation Error:", JSON.stringify(globalError, null, 2));
  }
}

// Example 1: Login with invalid email and short password
const loginErrorExample = {
    "success": false,
    "message": "Format email tidak valid. Contoh: user@example.com",
    "errors": [
        {
            "field": "email",
            "message": "Format email tidak valid. Contoh: user@example.com",
            "code": "invalid_string",
            "received": "invalid-email",
            "expected": "string"
        },
        {
            "field": "password",
            "message": "Password minimal 6 karakter",
            "code": "too_small",
            "received": 3,
            "expected": "6"
        }
    ],
    "meta": null
};

// Example 2: Registration with missing fields
const registerErrorExample = {
    "success": false,
    "message": "Email wajib diisi",
    "errors": [
        {
            "field": "email",
            "message": "Email wajib diisi",
            "code": "invalid_type",
            "received": "undefined",
            "expected": "string"
        },
        {
            "field": "name",
            "message": "Nama hanya boleh berisi huruf dan spasi",
            "code": "custom",
            "received": "user123",
            "expected": undefined
        }
    ],
    "meta": null
};

// Example 3: Single validation error
const singleErrorExample = {
    "success": false,
    "message": "Password minimal 6 karakter",
    "errors": [
        {
            "field": "password",
            "message": "Password minimal 6 karakter",
            "code": "too_small",
            "received": 4,
            "expected": "6"
        }
    ],
    "meta": null
};

/**
 * Benefits of the new format:
 * 
 * 1. message: Contains the first (most important) error message for quick display
 * 2. errors: Contains detailed information about all validation errors
 * 3. field: Shows which field has the error
 * 4. code: Provides error type for programmatic handling
 * 5. received/expected: Helps with debugging (optional)
 * 
 * Frontend Usage:
 * - Show `message` as main error notification
 * - Use `errors` array to highlight specific form fields
 * - Use `field` to map errors to form inputs
 * - Use `code` for conditional error handling
 */

export { loginErrorExample, registerErrorExample, singleErrorExample };