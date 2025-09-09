import { GlobalErrorType } from '../src/types/global.error.type';
import GlobalErrorHandler from '../src/lib/lib.error.handler';

// Example 1: Creating a custom error
const customError = GlobalErrorHandler.createError(
    GlobalErrorType.VALIDATION_ERROR,
    "Invalid email format",
    "INVALID_EMAIL",
    { field: "email", expected: "valid email address" }
);

console.log('Custom Error:', customError);

// Example 2: Handling Zod validation errors
// import { z } from 'zod';
// const schema = z.object({
//   email: z.string().email(),
//   age: z.number().min(18)
// });
// 
// try {
//   schema.parse({ email: "invalid-email", age: 15 });
// } catch (error) {
//   if (error instanceof z.ZodError) {
//     const globalError = GlobalErrorHandler.handleZodError(error);
//     console.log('Zod Error:', globalError);
//   }
// }

// Example 3: Using predefined error responses
const validationError = GlobalErrorHandler.errors.validation(
    "Password is required", 
    { field: "password", rule: "required" },
    "password"
);

const unauthorizedError = GlobalErrorHandler.errors.unauthorized("Access token is missing");

const notFoundError = GlobalErrorHandler.errors.notFound("User");

console.log('Validation Error:', validationError);
console.log('Unauthorized Error:', unauthorizedError);
console.log('Not Found Error:', notFoundError);

// Example 4: Handling database errors
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

const dbError = new DatabaseError("Unique constraint failed on field 'email'");
const globalDbError = GlobalErrorHandler.handleDatabaseError(dbError, "user creation", "User");

console.log('Database Error:', globalDbError);