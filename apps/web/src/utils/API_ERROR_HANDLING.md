# API Error Handling Guide

Standardized patterns for handling API errors consistently across the application.

## Quick Start

```typescript
import { parseApiError, withRetry, getErrorMessage } from './apiErrorHandler';
import { toast } from 'sonner';

// Pattern 1: Simple error handling with user feedback
try {
  const response = await api.get('/users/me');
  return response.data;
} catch (error) {
  const apiError = parseApiError(error);
  toast.error(apiError.message);
  throw error;
}

// Pattern 2: With automatic retry
const fetchUser = withRetry(() => api.get('/users/me'), {
  maxRetries: 3,
  initialDelay: 1000,
});

try {
  const response = await fetchUser();
  return response.data;
} catch (error) {
  toast.error(getErrorMessage(error));
}

// Pattern 3: In React Query
const { data, error } = useQuery({
  queryKey: ['user'],
  queryFn: withRetry(() => api.get('/users/me')),
  retry: false, // Let our utility handle retries
});

if (error) {
  const apiError = parseApiError(error);
  // Show error UI
}
```

## Core Functions

### `parseApiError(error)`

Converts any error into a standardized `ApiError` object.

```typescript
interface ApiError {
  status: number;           // HTTP status code (0 for network errors)
  message: string;          // User-friendly message
  details?: string;         // Technical details (for logging)
  endpoint?: string;        // Failed endpoint
  retryable: boolean;       // Whether retry would help
  originalError?: AxiosError;
}
```

**Usage:**
```typescript
try {
  await api.post('/goals', data);
} catch (error) {
  const apiError = parseApiError(error);

  if (apiError.status === 409) {
    toast.error('A goal with this name already exists.');
  } else {
    toast.error(apiError.message);
  }
}
```

### `withRetry(fn, config)`

Wraps an async function with automatic retry logic (exponential backoff with jitter).

**Configuration:**
```typescript
interface RetryConfig {
  maxRetries?: number;           // Default: 3
  initialDelay?: number;         // Default: 1000ms
  maxDelay?: number;             // Default: 10000ms
  retryableStatuses?: number[];  // Default: [408, 429, 500, 502, 503, 504]
}
```

**Usage:**
```typescript
// Simple retry
const fetchData = withRetry(() => api.get('/data'));

// Custom retry config
const fetchWithCustomRetry = withRetry(
  () => api.get('/critical-data'),
  {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
  }
);

// In React Query (recommended)
const { data } = useQuery({
  queryKey: ['critical-data'],
  queryFn: withRetry(() => api.get('/critical-data').then(res => res.data)),
  retry: false, // Disable React Query's retry
});
```

**Retry Behavior:**
- 1st retry: ~1 second
- 2nd retry: ~2 seconds
- 3rd retry: ~4 seconds
- Adds jitter (±20%) to prevent thundering herd
- Only retries network errors and 5xx server errors by default
- Does NOT retry 4xx client errors (bad request, unauthorized, etc.)

### `getErrorMessage(error)`

Quick utility to extract user-friendly message from any error.

```typescript
try {
  await api.post('/goals', data);
  toast.success('Goal created!');
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

### Error Type Checkers

Quick utilities for common error checks:

```typescript
import {
  isErrorStatus,
  isNetworkError,
  isServerError,
  isClientError,
} from './apiErrorHandler';

try {
  await api.delete('/goals/123');
} catch (error) {
  if (isErrorStatus(error, 404)) {
    toast.error('Goal not found.');
  } else if (isErrorStatus(error, 403)) {
    toast.error('You do not have permission to delete this goal.');
  } else if (isNetworkError(error)) {
    toast.error('Network error. Please check your connection.');
  } else if (isServerError(error)) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.error(getErrorMessage(error));
  }
}
```

## User-Friendly Messages

The utility automatically maps HTTP status codes to user-friendly messages:

| Status | Message |
|--------|---------|
| 400 | Invalid request. Please check your input and try again. |
| 401 | Your session has expired. Please log in again. |
| 403 | You do not have permission to perform this action. |
| 404 | The requested resource was not found. |
| 409 | This action conflicts with existing data. Please refresh and try again. |
| 422 | The data provided could not be processed. Please check your input. |
| 429 | Too many requests. Please wait a moment and try again. |
| 500 | A server error occurred. Our team has been notified. |
| 502/503 | Service temporarily unavailable. Please try again shortly. |
| 504 | Request timeout. Please check your connection and try again. |
| Network | Unable to connect to the server. Please check your connection. |

**Backend messages take precedence:** If the API returns a custom message in the response body, that message will be used instead.

## Integration with React Query

**Recommended pattern** for data fetching:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { parseApiError, withRetry } from '../utils/apiErrorHandler';
import { toast } from 'sonner';

// Query with retry
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: withRetry(() =>
      api.get('/goals').then(res => res.data)
    ),
    retry: false, // Let our utility handle retries
  });
}

// Mutation with error handling
export function useCreateGoal() {
  return useMutation({
    mutationFn: (data) => api.post('/goals', data),
    onSuccess: () => {
      toast.success('Goal created successfully!');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
}

// In component
function GoalsPage() {
  const { data, isLoading, error } = useGoals();
  const createGoal = useCreateGoal();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    const apiError = parseApiError(error);
    return (
      <StateCard
        state="error"
        title="Failed to load goals"
        message={apiError.message}
        action={{
          label: 'Retry',
          onClick: () => queryClient.invalidateQueries(['goals']),
        }}
      />
    );
  }

  return (
    <div>
      {data.map(goal => <GoalCard key={goal.id} goal={goal} />)}
    </div>
  );
}
```

## Integration with Forms

```typescript
import { useForm } from 'react-hook-form';
import { parseApiError } from '../utils/apiErrorHandler';

function GoalForm() {
  const { register, handleSubmit, setError } = useForm();
  const createGoal = useCreateGoal();

  const onSubmit = async (data) => {
    try {
      await createGoal.mutateAsync(data);
      toast.success('Goal created!');
      navigate('/goals');
    } catch (error) {
      const apiError = parseApiError(error);

      // Field-specific errors
      if (apiError.status === 409) {
        setError('name', {
          message: 'A goal with this name already exists.',
        });
      } else {
        // General error
        toast.error(apiError.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

## Best Practices

### ✅ DO

1. **Use `withRetry` for critical data fetching**
   ```typescript
   const fetchCriticalData = withRetry(() => api.get('/critical'));
   ```

2. **Always show user feedback**
   ```typescript
   catch (error) {
     toast.error(getErrorMessage(error));
   }
   ```

3. **Handle specific errors when needed**
   ```typescript
   if (isErrorStatus(error, 404)) {
     // Handle not found
   }
   ```

4. **Let the utility handle error reporting**
   - Server errors (5xx) are automatically reported to Sentry
   - Network errors are automatically reported

5. **Integrate with React Query**
   - Disable React Query's retry when using `withRetry`
   - Use `parseApiError` in error states

### ❌ DON'T

1. **Don't use raw axios errors directly**
   ```typescript
   // ❌ Bad
   catch (error) {
     toast.error(error.response?.data?.message || 'Error');
   }

   // ✅ Good
   catch (error) {
     toast.error(getErrorMessage(error));
   }
   ```

2. **Don't retry 4xx errors**
   - These are client errors and retrying won't help
   - The utility already excludes them from retry

3. **Don't show technical error details to users**
   ```typescript
   // ❌ Bad
   toast.error(error.stack);

   // ✅ Good
   const apiError = parseApiError(error);
   toast.error(apiError.message);
   console.error(apiError.details); // Log details for debugging
   ```

4. **Don't ignore network errors**
   ```typescript
   // ❌ Bad
   catch (error) {
     if (error.response) {
       // Only handling response errors
     }
     // Network errors ignored!
   }

   // ✅ Good
   catch (error) {
     toast.error(getErrorMessage(error)); // Handles all error types
   }
   ```

## Migration from Old Patterns

### Before (inconsistent):
```typescript
// Old pattern 1
catch (error) {
  toast.error(error.response?.data?.message || 'Something went wrong');
}

// Old pattern 2
catch (error) {
  console.error(error);
  toast.error('Failed to load data');
}

// Old pattern 3
catch (error) {
  if (error.response?.status === 404) {
    toast.error('Not found');
  }
}
```

### After (standardized):
```typescript
import { parseApiError, getErrorMessage } from '../utils/apiErrorHandler';

// All patterns use consistent utility
catch (error) {
  const apiError = parseApiError(error);

  // Option 1: Quick message
  toast.error(getErrorMessage(error));

  // Option 2: Custom handling
  if (apiError.status === 404) {
    toast.error('Resource not found');
  } else {
    toast.error(apiError.message);
  }
}
```

## Testing

```typescript
import { parseApiError, isNetworkError } from './apiErrorHandler';
import { AxiosError } from 'axios';

describe('API Error Handling', () => {
  it('should parse 404 errors correctly', () => {
    const axiosError = new AxiosError('Not Found');
    axiosError.response = { status: 404 } as any;

    const apiError = parseApiError(axiosError);

    expect(apiError.status).toBe(404);
    expect(apiError.message).toContain('not found');
    expect(apiError.retryable).toBe(false);
  });

  it('should detect network errors', () => {
    const axiosError = new AxiosError('Network Error');
    axiosError.code = 'ERR_NETWORK';

    expect(isNetworkError(axiosError)).toBe(true);
  });
});
```

## Error Reporting

- **Automatic reporting:** All 5xx errors and network errors are automatically sent to Sentry
- **Error context:** Includes endpoint, status code, and timestamp
- **Privacy:** Sensitive data (tokens, passwords) is never included in reports
- **Development:** Errors are logged to console in development mode

## Advanced: Custom Error Handlers

For special cases, you can create custom error handlers:

```typescript
import { parseApiError } from './apiErrorHandler';

function handleAuthError(error: unknown) {
  const apiError = parseApiError(error);

  if (apiError.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (apiError.status === 403) {
    // Show permission denied page
    navigate('/forbidden');
  } else {
    toast.error(apiError.message);
  }
}

// Usage
try {
  await api.get('/admin/users');
} catch (error) {
  handleAuthError(error);
}
```

## Summary

- ✅ Use `parseApiError()` for standardized error objects
- ✅ Use `getErrorMessage()` for quick user messages
- ✅ Use `withRetry()` for automatic retry logic
- ✅ Always show user feedback (toasts, error states)
- ✅ Integrate with React Query for data fetching
- ✅ Let the utility handle error reporting
- ✅ Handle specific errors when needed

This ensures consistent, user-friendly error handling across the entire application.
