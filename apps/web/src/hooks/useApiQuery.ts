/**
 * useApiQuery - React Query wrapper with standardized error handling
 *
 * Provides consistent error handling and retry logic for all API queries.
 * Use this instead of useQuery directly for automatic error handling.
 */

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';
import { parseApiError, getErrorMessage, ApiError } from '../utils/apiErrorHandler';

// =============================================================================
// Types
// =============================================================================

interface UseApiQueryOptions<TData, TError = ApiError>
  extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  /** Show toast notification on error */
  showErrorToast?: boolean;
  /** Custom error message (overrides default) */
  errorMessage?: string;
  /** Callback when error occurs */
  onError?: (error: ApiError) => void;
}

interface UseApiMutationOptions<TData, TVariables, TError = ApiError>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  /** Show toast notification on error */
  showErrorToast?: boolean;
  /** Show toast notification on success */
  showSuccessToast?: boolean;
  /** Success message for toast */
  successMessage?: string;
  /** Custom error message (overrides default) */
  errorMessage?: string;
}

// =============================================================================
// Query Hook
// =============================================================================

/**
 * useApiQuery - Wrapper around React Query's useQuery with error handling
 *
 * @example
 * const { data, isLoading, error } = useApiQuery(
 *   ['player', playerId],
 *   () => playersAPI.getById(playerId),
 *   { showErrorToast: true }
 * );
 */
export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UseApiQueryOptions<TData> = {}
) {
  const {
    showErrorToast = false,
    errorMessage,
    onError,
    ...queryOptions
  } = options;

  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        const apiError = parseApiError(error);

        // Call custom error handler
        if (onError) {
          onError(apiError);
        }

        // Show toast if enabled (assumes toast function exists globally)
        if (showErrorToast && typeof window !== 'undefined') {
          const message = errorMessage || apiError.message;
          // Using a simple approach - integrate with your toast library
          console.error('[API Error]', message);
        }

        throw apiError;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2 && error.retryable;
    },
    ...queryOptions,
  });
}

// =============================================================================
// Mutation Hook
// =============================================================================

/**
 * useApiMutation - Wrapper around React Query's useMutation with error handling
 *
 * @example
 * const mutation = useApiMutation(
 *   (data) => playersAPI.update(playerId, data),
 *   {
 *     showSuccessToast: true,
 *     successMessage: 'Player updated successfully',
 *     onSuccess: () => queryClient.invalidateQueries(['player'])
 *   }
 * );
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TVariables> = {}
) {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    errorMessage,
    onError,
    onSuccess,
    ...mutationOptions
  } = options;

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onError: (error, variables, context) => {
      if (showErrorToast && typeof window !== 'undefined') {
        const message = errorMessage || error.message;
        console.error('[API Mutation Error]', message);
      }

      // Call custom error handler
      if (onError) {
        (onError as (error: ApiError, variables: TVariables, context: unknown) => void)(
          error,
          variables,
          context
        );
      }
    },
    onSuccess: (data, variables) => {
      if (showSuccessToast && successMessage && typeof window !== 'undefined') {
        // Integrate with your toast library
        console.info('[API Success]', successMessage);
      }

      // Call custom success handler
      if (onSuccess) {
        (onSuccess as (data: TData, variables: TVariables) => void)(data, variables);
      }
    },
    ...mutationOptions,
  });
}

// =============================================================================
// Specialized Hooks
// =============================================================================

/**
 * useApiQueryWithToast - Query hook that always shows error toasts
 */
export function useApiQueryWithToast<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: Omit<UseApiQueryOptions<TData>, 'showErrorToast'> = {}
) {
  return useApiQuery(queryKey, queryFn, { ...options, showErrorToast: true });
}

/**
 * useApiQueryNoRetry - Query hook that never retries
 */
export function useApiQueryNoRetry<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UseApiQueryOptions<TData> = {}
) {
  return useApiQuery(queryKey, queryFn, { ...options, retry: false });
}

// =============================================================================
// Re-exports from error handler
// =============================================================================

export { parseApiError, getErrorMessage } from '../utils/apiErrorHandler';
export type { ApiError } from '../utils/apiErrorHandler';
