# API Error Handling Migration Example

This example shows how to migrate an existing hook to use standardized error handling.

## Before (Old Pattern)

```typescript
// apps/web/src/hooks/useAnalyseHubStats.ts (BEFORE)

import { useState, useEffect, useCallback } from 'react';
import {
  playerInsightsAPI,
  notesAPI,
  testsAPI,
} from '../services/api';

export function useAnalyseHubStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [sgJourneyRes, notesRes, testsRes] = await Promise.allSettled([
        playerInsightsAPI.getSGJourney(),
        notesAPI.getAll({ category: 'coach-report' }),
        testsAPI.getResults('me'),
      ]);

      // Extract data
      let strokesGained = 0;
      if (sgJourneyRes.status === 'fulfilled' && sgJourneyRes.value.data?.data) {
        const sgData = sgJourneyRes.value.data.data;
        strokesGained = sgData.currentSG || 0;
      }

      // ... more data extraction

      setStats({
        strokesGained,
        // ... more stats
      });
    } catch (err) {
      console.error('Failed to fetch analyse hub stats:', err);
      setError(err.response?.data?.message || 'Could not load analysis statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

// Usage in component (BEFORE)
function AnalyseHub() {
  const { stats, isLoading, error, refetch } = useAnalyseHubStats();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return <div>Error: {error}</div>; // ❌ Poor error UI
  }

  return <div>{/* render stats */}</div>;
}
```

**Problems with old pattern:**
- ❌ Manual loading/error state management
- ❌ Inconsistent error messages (`err.response?.data?.message || ...`)
- ❌ No retry logic for transient failures
- ❌ Poor error UI
- ❌ Not using React Query for caching/refetching
- ❌ Manual Promise.allSettled handling

---

## After (New Pattern - Option 1: React Query)

```typescript
// apps/web/src/hooks/useAnalyseHubStats.ts (AFTER - React Query)

import { useApiQuery } from './useApiQuery';
import {
  playerInsightsAPI,
  notesAPI,
  testsAPI,
} from '../services/api';

interface AnalyseHubStats {
  strokesGained: number;
  newReports: number;
  testsDue: number;
  // ... other stats
}

/**
 * Fetches analysis hub statistics with automatic retry and error handling
 */
export function useAnalyseHubStats() {
  return useApiQuery<AnalyseHubStats>({
    queryKey: ['analyse-hub-stats'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [sgJourneyRes, notesRes, testsRes] = await Promise.allSettled([
        playerInsightsAPI.getSGJourney(),
        notesAPI.getAll({ category: 'coach-report' }),
        testsAPI.getResults('me'),
      ]);

      // Extract SG data
      let strokesGained = 0;
      if (sgJourneyRes.status === 'fulfilled' && sgJourneyRes.value.data?.data) {
        const sgData = sgJourneyRes.value.data.data;
        strokesGained = sgData.currentSG || 0;
      }

      // Extract reports data
      let newReports = 0;
      if (notesRes.status === 'fulfilled' && notesRes.value.data?.data) {
        const notes = notesRes.value.data.data;
        newReports = notes.filter((note: any) => !note.viewed).length;
      }

      // ... more data extraction

      // Return as successful response
      return {
        data: {
          strokesGained,
          newReports,
          // ... more stats
        },
      };
    },
    enableRetry: true,  // ✅ Automatic retry on failure
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });
}

// Usage in component (AFTER - Better!)
import { StateCard } from '../components/ui/composites/StateCard.composite';
import { getErrorMessage } from '../utils/apiErrorHandler';

function AnalyseHub() {
  const { data: stats, isLoading, error, refetch } = useAnalyseHubStats();

  if (isLoading) {
    return <LoadingSpinner message="Loading analysis..." />;
  }

  if (error) {
    return (
      <StateCard
        state="error"
        title="Failed to load analysis"
        message={getErrorMessage(error)}
        action={{
          label: 'Retry',
          onClick: refetch,
        }}
      />
    );
  }

  return <div>{/* render stats */}</div>;
}
```

**Benefits of new pattern:**
- ✅ Automatic retry with exponential backoff
- ✅ Consistent error messages
- ✅ Better error UI with retry button
- ✅ React Query caching (no duplicate requests)
- ✅ Automatic refetching on window focus
- ✅ Less boilerplate code
- ✅ Type-safe with TypeScript

---

## After (New Pattern - Option 2: Individual Queries)

For more granular control, split into separate queries:

```typescript
// apps/web/src/hooks/useAnalyseHubStats.ts (AFTER - Individual queries)

import { useApiQuery } from './useApiQuery';
import { playerInsightsAPI, notesAPI, testsAPI } from '../services/api';

export function useStrokesGained() {
  return useApiQuery({
    queryKey: ['strokes-gained'],
    queryFn: () => playerInsightsAPI.getSGJourney(),
    enableRetry: true,
    select: (res) => res.data?.data?.currentSG || 0,
  });
}

export function useNewReports() {
  return useApiQuery({
    queryKey: ['new-reports'],
    queryFn: () => notesAPI.getAll({ category: 'coach-report' }),
    enableRetry: true,
    select: (res) => {
      const notes = res.data?.data || [];
      return notes.filter((note: any) => !note.viewed).length;
    },
  });
}

export function useTestsDue() {
  return useApiQuery({
    queryKey: ['tests-due'],
    queryFn: () => testsAPI.getResults('me'),
    enableRetry: true,
    select: (res) => {
      // Calculate tests due from response
      return 2; // Example
    },
  });
}

// Aggregate hook
export function useAnalyseHubStats() {
  const { data: strokesGained = 0, isLoading: sgLoading } = useStrokesGained();
  const { data: newReports = 0, isLoading: reportsLoading } = useNewReports();
  const { data: testsDue = 0, isLoading: testsLoading } = useTestsDue();

  const isLoading = sgLoading || reportsLoading || testsLoading;

  return {
    data: {
      strokesGained,
      newReports,
      testsDue,
    },
    isLoading,
  };
}

// Usage in component (AFTER - Granular control)
function AnalyseHub() {
  const { data: stats, isLoading } = useAnalyseHubStats();

  // Can also use individual hooks for specific sections
  const { data: sg, error: sgError } = useStrokesGained();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <StatsCard label="Strokes Gained" value={stats.strokesGained} />
      {sgError && <ErrorBanner message={getErrorMessage(sgError)} />}
      <StatsCard label="New Reports" value={stats.newReports} />
      <StatsCard label="Tests Due" value={stats.testsDue} />
    </div>
  );
}
```

**Benefits of this approach:**
- ✅ Independent caching for each query
- ✅ Can show partial data even if one query fails
- ✅ Fine-grained loading states
- ✅ Better for large dashboards with many data sources

---

## Mutation Example: Create Goal

### Before
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  try {
    setIsSubmitting(true);
    await api.post('/goals', data);
    alert('Goal created!'); // ❌ Bad UX
    navigate('/goals');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed'); // ❌ Inconsistent
  } finally {
    setIsSubmitting(false);
  }
};
```

### After
```typescript
import { useApiMutation } from '../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';

function GoalForm() {
  const queryClient = useQueryClient();

  const createGoal = useApiMutation({
    mutationFn: (data) => api.post('/goals', data),
    successMessage: 'Goal created successfully!', // ✅ Toast
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']); // ✅ Auto-refresh
      navigate('/goals');
    },
  });

  const handleSubmit = (data) => {
    createGoal.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button
        type="submit"
        disabled={createGoal.isPending}
        isLoading={createGoal.isPending}
      >
        Create Goal
      </Button>
    </form>
  );
}
```

---

## Migration Checklist

When migrating a hook or component:

- [ ] Replace `useState`/`useEffect` with `useApiQuery` or `useApiMutation`
- [ ] Remove manual `try-catch` error handling
- [ ] Replace custom error messages with `getErrorMessage()`
- [ ] Use `StateCard` for error UI (not plain `<div>`)
- [ ] Enable retry for critical queries (`enableRetry: true`)
- [ ] Add success toast messages for mutations
- [ ] Use React Query's `invalidateQueries` to refresh data
- [ ] Remove manual loading state management
- [ ] Add proper TypeScript types
- [ ] Test error scenarios (disconnect network, 500 errors, etc.)

---

## Key Takeaways

1. **Use `useApiQuery` for fetching** - Automatic caching, retry, and error handling
2. **Use `useApiMutation` for updates** - Automatic success/error feedback
3. **Use `getErrorMessage()` for manual error handling** - Consistent messages
4. **Use `StateCard` for error UI** - Better UX with retry buttons
5. **Enable retry for critical data** - Improves reliability
6. **Let React Query manage state** - Less boilerplate, more features

Result: **Less code, better UX, consistent error handling** ✨
