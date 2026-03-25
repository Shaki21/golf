/**
 * API Error Handler Utility
 *
 * Standardizes error handling across the application:
 * - User-friendly error messages
 * - Retry logic with exponential backoff
 * - Error reporting integration
 * - Consistent error response formats
 */

import { AxiosError } from 'axios';
import { captureAPIError } from './errorReporter';

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  /** HTTP status code */
  status: number;
  /** User-friendly error message */
  message: string;
  /** Technical error details (for logging/debugging) */
  details?: string;
  /** Endpoint that failed */
  endpoint?: string;
  /** Whether the request can be retried */
  retryable: boolean;
  /** Original axios error */
  originalError?: AxiosError;
}

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay in milliseconds (doubles with each retry) */
  initialDelay?: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay?: number;
  /** Status codes that should trigger a retry */
  retryableStatuses?: number[];
}

// =============================================================================
// Error Message Mapping
// =============================================================================

/**
 * Maps HTTP status codes to user-friendly messages
 */
const STATUS_MESSAGES: Record<number, string> = {
  // 4xx Client Errors
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  422: 'The data provided could not be processed. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',

  // 5xx Server Errors
  500: 'A server error occurred. Our team has been notified.',
  502: 'Service temporarily unavailable. Please try again shortly.',
  503: 'Service maintenance in progress. Please try again shortly.',
  504: 'Request timeout. Please check your connection and try again.',
};

/**
 * Network error messages (when no response received)
 */
const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  ECONNABORTED: 'Request timeout. Please check your connection and try again.',
  ERR_NETWORK: 'Network error. Please check your internet connection.',
  ERR_CANCELED: 'Request was cancelled.',
  default: 'Unable to connect to the server. Please check your connection.',
};

// =============================================================================
// Error Parsing
// =============================================================================

/**
 * Extracts user-friendly error message from axios error
 */
function getUserMessage(error: AxiosError): string {
  // 1. Try to get message from response body
  const responseData = error.response?.data as any;
  if (responseData?.message) {
    return responseData.message;
  }
  if (responseData?.error) {
    return responseData.error;
  }

  // 2. Use status code mapping
  if (error.response?.status) {
    return STATUS_MESSAGES[error.response.status] || 'An unexpected error occurred.';
  }

  // 3. Network errors (no response)
  if (error.code) {
    return NETWORK_ERROR_MESSAGES[error.code] || NETWORK_ERROR_MESSAGES.default;
  }

  // 4. Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Determines if an error is retryable
 */
function isRetryable(error: AxiosError, retryableStatuses: number[] = [408, 429, 500, 502, 503, 504]): boolean {
  // Network errors are retryable
  if (!error.response) {
    return ['ECONNABORTED', 'ERR_NETWORK', 'ETIMEDOUT'].includes(error.code || '');
  }

  // Check if status code is in retryable list
  return retryableStatuses.includes(error.response.status);
}

/**
 * Converts axios error to standardized ApiError
 */
export function parseApiError(error: unknown): ApiError {
  // Handle non-axios errors
  if (!(error instanceof Error)) {
    return {
      status: 0,
      message: 'An unexpected error occurred.',
      retryable: false,
    };
  }

  // Handle axios errors
  const axiosError = error as AxiosError;

  const apiError: ApiError = {
    status: axiosError.response?.status || 0,
    message: getUserMessage(axiosError),
    details: axiosError.message,
    endpoint: axiosError.config?.url,
    retryable: isRetryable(axiosError),
    originalError: axiosError,
  };

  // Report to error tracking if it's a server error
  if (apiError.status >= 500 || apiError.status === 0) {
    captureAPIError(
      apiError.endpoint || 'unknown',
      apiError.status,
      apiError.details || apiError.message
    );
  }

  return apiError;
}

// =============================================================================
// Retry Logic
// =============================================================================

/**
 * Delays execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates delay for exponential backoff with jitter
 */
function calculateBackoff(attempt: number, initialDelay: number, maxDelay: number): number {
  // Exponential: 1000ms, 2000ms, 4000ms, 8000ms, etc.
  const exponentialDelay = initialDelay * Math.pow(2, attempt);

  // Add jitter (±20%) to prevent thundering herd
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);

  // Apply max delay cap
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Wraps an async function with retry logic
 *
 * @example
 * const getUser = withRetry(() => api.get('/users/me'), { maxRetries: 3 });
 * const user = await getUser();
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): () => Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
  } = config;

  return async (): Promise<T> => {
    let lastError: unknown;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const apiError = parseApiError(error);

        // Don't retry if not retryable or max attempts reached
        if (!apiError.retryable || attempt === maxRetries) {
          throw error;
        }

        // Check if status is in retryable list
        if (apiError.status > 0 && !retryableStatuses.includes(apiError.status)) {
          throw error;
        }

        // Wait before retrying
        const delayMs = calculateBackoff(attempt, initialDelay, maxDelay);
        await delay(delayMs);

        attempt++;
      }
    }

    // Should never reach here, but TypeScript doesn't know that
    throw lastError;
  };
}

// =============================================================================
// Error Handler Wrapper
// =============================================================================

/**
 * Wraps an async function to handle errors consistently
 *
 * @example
 * const getUser = handleApiError(
 *   () => api.get('/users/me'),
 *   { onError: (err) => toast.error(err.message) }
 * );
 */
export function handleApiError<T>(
  fn: () => Promise<T>,
  options?: {
    /** Custom error handler (e.g., show toast) */
    onError?: (error: ApiError) => void;
    /** Whether to rethrow the error after handling */
    rethrow?: boolean;
    /** Custom fallback value on error */
    fallback?: T;
  }
): () => Promise<T | undefined> {
  return async (): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (error) {
      const apiError = parseApiError(error);

      // Call custom error handler
      if (options?.onError) {
        options.onError(apiError);
      }

      // Rethrow if requested
      if (options?.rethrow) {
        throw error;
      }

      // Return fallback value
      if (options?.fallback !== undefined) {
        return options.fallback;
      }

      return undefined;
    }
  };
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Extracts error message from unknown error
 * Useful for catch blocks when you just need the message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const apiError = parseApiError(error);
    return apiError.message;
  }
  return 'An unexpected error occurred.';
}

/**
 * Checks if error is a specific HTTP status
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  const apiError = parseApiError(error);
  return apiError.status === status;
}

/**
 * Checks if error is a network error (no response)
 */
export function isNetworkError(error: unknown): boolean {
  const apiError = parseApiError(error);
  return apiError.status === 0;
}

/**
 * Checks if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  const apiError = parseApiError(error);
  return apiError.status >= 500 && apiError.status < 600;
}

/**
 * Checks if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  const apiError = parseApiError(error);
  return apiError.status >= 400 && apiError.status < 500;
}
