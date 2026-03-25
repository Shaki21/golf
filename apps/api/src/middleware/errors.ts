/**
 * Custom Error Classes
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: Record<string, unknown>) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: Record<string, unknown>) {
    super(409, 'CONFLICT', message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: { field: string; message: string }[] | Record<string, unknown>) {
    // Cast to Record for AppError compatibility - the array format is intentional for validation errors
    super(400, 'VALIDATION_ERROR', message, details as Record<string, unknown>);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', details?: Record<string, unknown>) {
    super(429, 'TOO_MANY_REQUESTS', message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
