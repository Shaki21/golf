import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from './track';

/**
 * Hook to track screen views
 * Fires on mount and when path changes
 *
 * @param screenName - Human-readable screen name
 *
 * @example
 * function DashboardPage() {
 *   useScreenView('Dashboard');
 *   return <div>...</div>;
 * }
 */
export function useScreenView(screenName: string): void {
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track if path actually changed (prevents double-firing)
    if (lastPathRef.current === location.pathname) {
      return;
    }

    lastPathRef.current = location.pathname;

    track('screen_view', {
      screen: screenName,
      source: 'navigation',
      type: 'page_view',
    });
  }, [location.pathname, screenName]);
}

export default useScreenView;
