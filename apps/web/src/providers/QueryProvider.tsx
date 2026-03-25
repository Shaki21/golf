/**
 * React Query Provider
 *
 * Configures and provides the QueryClient for the application.
 * Includes default options for stale time, cache time, and retry logic.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// =============================================================================
// Query Client Configuration
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Cache is kept for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: true,
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
    },
  },
});

// =============================================================================
// Provider Component
// =============================================================================

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

// =============================================================================
// Export Query Client for external use
// =============================================================================

export { queryClient };
export default QueryProvider;
