// Standard error types
export type ErrorType =
  | 'validation_error'
  | 'authentication_error'
  | 'authorization_error'
  | 'domain_violation'
  | 'system_failure';

// Error codes mapping
const ERROR_TYPE_TO_CODE: Record<ErrorType, string> = {
  validation_error: 'VALIDATION_ERROR',
  authentication_error: 'UNAUTHORIZED',
  authorization_error: 'FORBIDDEN',
  domain_violation: 'NOT_FOUND',
  system_failure: 'INTERNAL_SERVER_ERROR',
};

export interface StandardError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export class AppError extends Error {
  public code: string;

  constructor(
    public type: ErrorType,
    message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = ERROR_TYPE_TO_CODE[type];
  }

  toJSON(): StandardError {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// Error factory functions
export const validationError = (message: string, details?: Record<string, any>) =>
  new AppError('validation_error', message, 400, details);

export const authenticationError = (message: string = 'Authentication required') =>
  new AppError('authentication_error', message, 401);

export const authorizationError = (message: string = 'Access denied') =>
  new AppError('authorization_error', message, 403);

export const domainViolation = (message: string, details?: Record<string, any>) =>
  new AppError('domain_violation', message, 422, details);

export const systemFailure = (message: string = 'System error occurred') =>
  new AppError('system_failure', message, 500);
