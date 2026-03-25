# API Error Handling - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### React Query - Fetch Data
```typescript
import { useApiQuery } from '../hooks/useApiQuery';

const { data, isLoading, error } = useApiQuery({
  queryKey: ['goals'],
  queryFn: () => api.get('/goals'),
  enableRetry: true,
});
```

### React Query - Mutate Data
```typescript
import { useApiMutation } from '../hooks/useApiQuery';

const createGoal = useApiMutation({
  mutationFn: (data) => api.post('/goals', data),
  successMessage: 'Goal created!',
  onSuccess: () => queryClient.invalidateQueries(['goals']),
});

// In component
<Button onClick={() => createGoal.mutate(formData)}>
  Create Goal
</Button>
```

### Simple Try-Catch
```typescript
import { getErrorMessage } from '../utils/apiErrorHandler';

try {
  await api.post('/goals', data);
  toast.success('Goal created!');
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

## 📋 Common Patterns

### Show Error State in UI
```typescript
if (error) {
  return (
    <StateCard
      state="error"
      title="Failed to load"
      message={getErrorMessage(error)}
      action={{ label: 'Retry', onClick: refetch }}
    />
  );
}
```

### Handle Specific Errors
```typescript
import { isErrorStatus, getErrorMessage } from '../utils/apiErrorHandler';

try {
  await api.delete('/goals/123');
} catch (error) {
  if (isErrorStatus(error, 404)) {
    toast.error('Goal not found');
  } else if (isErrorStatus(error, 403)) {
    toast.error('Permission denied');
  } else {
    toast.error(getErrorMessage(error));
  }
}
```

### With Form Validation
```typescript
const { setError } = useForm();

try {
  await api.post('/goals', data);
  navigate('/goals');
} catch (error) {
  if (isErrorStatus(error, 409)) {
    setError('name', { message: 'Name already exists' });
  } else {
    toast.error(getErrorMessage(error));
  }
}
```

### Manual Retry
```typescript
import { withRetry } from '../utils/apiErrorHandler';

const fetchCritical = withRetry(
  () => api.get('/critical-data'),
  { maxRetries: 5 }
);

const data = await fetchCritical();
```

## 🎯 When to Use What

| Scenario | Use |
|----------|-----|
| Fetch data with React Query | `useApiQuery` |
| Create/Update/Delete with React Query | `useApiMutation` |
| One-off API call | `try-catch` + `getErrorMessage` |
| Need specific error handling | `isErrorStatus` |
| Critical data (must retry) | `withRetry` |
| Show toast on error | Set `showErrorToast: true` |

## ⚡ Do's and Don'ts

### ✅ DO
```typescript
// Use standardized utilities
toast.error(getErrorMessage(error));

// Show user feedback
onSuccess: () => toast.success('Saved!'),

// Handle specific cases
if (isErrorStatus(error, 404)) { /* ... */ }
```

### ❌ DON'T
```typescript
// Use raw axios errors
toast.error(error.response?.data?.message); // ❌

// Show technical details to users
toast.error(error.stack); // ❌

// Ignore errors
catch (error) {} // ❌

// Mix patterns
// Use either useApiQuery OR useQuery, not both
```

## 🔧 Utilities Cheat Sheet

```typescript
// Get user-friendly message
getErrorMessage(error)

// Parse full error details
parseApiError(error)

// Check error type
isErrorStatus(error, 404)
isNetworkError(error)
isServerError(error)
isClientError(error)

// Wrap with retry
withRetry(fn, { maxRetries: 3 })

// React Query hooks
useApiQuery({ queryKey, queryFn })
useApiMutation({ mutationFn, successMessage })
```

## 📖 Full Documentation

See `/src/utils/API_ERROR_HANDLING.md` for complete guide with examples and best practices.

---

**Remember:** Consistent error handling = Better UX + Easier debugging!
