# Validation Error Response Format

## Overview

This document describes the standardized validation error response format used by the API for better frontend integration.

## Response Structure

When validation fails, the API returns a response with the following structure:

```json
{
  "success": false,
  "message": "First error message for quick display",
  "errors": [
    {
      "field": "field_name",
      "message": "Human-readable error message",
      "code": "zod_error_code",
      "received": "actual_value_received (optional)",
      "expected": "expected_type_or_value (optional)"
    }
  ],
  "meta": null
}
```

## Fields Description

### Root Level
- **success**: Always `false` for validation errors
- **message**: The first error message from the errors array - use this for general error notifications
- **errors**: Array containing detailed information about all validation errors
- **meta**: Additional metadata (usually `null` for validation errors)

### Error Object
- **field**: The name of the field that failed validation (e.g., "email", "password", "name")
- **message**: Human-readable error message in Indonesian
- **code**: Zod validation error code for programmatic handling
- **received**: (Optional) The actual value that was received
- **expected**: (Optional) The expected type or value

## Error Codes

Common Zod error codes you might encounter:

- `invalid_type`: Field has wrong data type
- `invalid_string`: String validation failed (e.g., email format)
- `too_small`: Value is below minimum requirement
- `too_big`: Value exceeds maximum requirement
- `custom`: Custom validation rule failed

## Frontend Integration Examples

### React Example

```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
  received?: unknown;
  expected?: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors: ValidationError[];
  meta: null;
}

// Handle validation errors
const handleValidationError = (errorResponse: ErrorResponse) => {
  // Show main error message
  toast.error(errorResponse.message);
  
  // Highlight specific form fields
  errorResponse.errors.forEach(error => {
    setFieldError(error.field, error.message);
  });
};
```

### Vue.js Example

```javascript
// In your Vue component
handleApiError(response) {
  if (!response.success && response.errors) {
    // Show main error
    this.$toast.error(response.message);
    
    // Clear previous errors
    this.formErrors = {};
    
    // Set field-specific errors
    response.errors.forEach(error => {
      this.formErrors[error.field] = error.message;
    });
  }
}
```

### Angular Example

```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
  received?: any;
  expected?: string;
}

handleValidationErrors(errors: ValidationError[]) {
  // Clear previous errors
  this.formGroup.setErrors(null);
  
  errors.forEach(error => {
    const control = this.formGroup.get(error.field);
    if (control) {
      control.setErrors({ serverError: error.message });
    }
  });
}
```

## Best Practices

### For Frontend Developers

1. **Always check the `success` field** to determine if the request was successful
2. **Use `message` for general notifications** (toasts, alerts)
3. **Use `errors` array for field-specific validation** (form field highlighting)
4. **Map errors by `field` name** to your form inputs
5. **Consider the `code` for conditional handling** if needed

### Example Usage Flow

```typescript
try {
  const response = await api.post('/auth/login', loginData);
  // Handle success
} catch (error) {
  if (error.response?.data?.errors) {
    const { message, errors } = error.response.data;
    
    // Show general error
    showNotification(message, 'error');
    
    // Highlight form fields
    errors.forEach(err => {
      highlightField(err.field, err.message);
    });
  }
}
```

## Migration from Old Format

If you were previously using the old error format, here's how to migrate:

### Old Format
```json
{
  "success": false,
  "message": "Data login tidak valid",
  "errorDetail": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ]
}
```

### New Format
```json
{
  "success": false,
  "message": "Format email tidak valid. Contoh: user@example.com",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid. Contoh: user@example.com",
      "code": "invalid_string"
    }
  ]
}
```

### Migration Steps
1. Change `errorDetail` to `errors` in your frontend code
2. Use the first error's message as the main message instead of a generic message
3. Take advantage of the new `code` field for better error handling
4. Update your error display logic to use the more descriptive messages

## API Endpoints Using This Format

Currently implemented in:
- `POST /auth/login` - Login validation
- `POST /auth/register` - Registration validation

Future endpoints will follow the same pattern for consistency.