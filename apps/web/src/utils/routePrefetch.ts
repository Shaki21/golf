/**
 * Route Prefetching Utility
 *
 * Prefetches likely next routes based on user role and current location.
 * This improves perceived performance by loading routes before they're needed.
 */

type RouteLoader = () => Promise<any>;

interface PrefetchConfig {
  /** Delay before prefetching (ms) - wait for user to be idle */
  delay?: number;
  /** Whether to prefetch on initial load */
  enabled?: boolean;
}

/**
 * Prefetch routes based on user role
 */
export function prefetchRoutesForRole(
  role: string,
  config: PrefetchConfig = {}
): () => void {
  const { delay = 2000, enabled = true } = config;

  if (!enabled) return () => {};

  const routeLoaders = getRoleRoutes(role);

  // Wait for idle time before prefetching
  const timer = setTimeout(() => {
    // Request idle callback if available, otherwise just prefetch
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        prefetchRoutes(routeLoaders);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchRoutes(routeLoaders);
      }, 0);
    }
  }, delay);

  // Return cleanup function
  return () => clearTimeout(timer);
}

/**
 * Prefetch specific routes immediately
 */
export function prefetchRoutes(loaders: RouteLoader[]): void {
  loaders.forEach((loader) => {
    try {
      loader().catch((error) => {
        // Silently fail - prefetch is not critical
        console.debug('[Prefetch] Failed to prefetch route:', error.message);
      });
    } catch (error) {
      console.debug('[Prefetch] Error initiating prefetch:', error);
    }
  });
}

/**
 * Get common routes for each user role
 */
function getRoleRoutes(role: string): RouteLoader[] {
  switch (role) {
    case 'player':
      return getPlayerRoutes();
    case 'coach':
      return getCoachRoutes();
    case 'admin':
      return getAdminRoutes();
    default:
      return [];
  }
}

/**
 * Player routes - most likely navigation paths
 */
function getPlayerRoutes(): RouteLoader[] {
  return [
    // Hub pages (most common)
    () => import('../features/hub-pages/DashboardHub'),
    () => import('../features/hub-pages/TreningHub'),
    () => import('../features/hub-pages/PlanHub'),

    // Calendar (second most common)
    () => import('../features/calendar/CalendarPage'),

    // Goals (common after dashboard)
    () => import('../features/goals/GoalsPage'),

    // Profile (common settings access)
    () => import('../features/profile/BrukerprofilContainer'),
  ];
}

/**
 * Coach routes - most likely navigation paths
 */
function getCoachRoutes(): RouteLoader[] {
  return [
    // Coach dashboard
    () => import('../features/coach-dashboard').then((m) => ({ default: m.CoachDashboard })),

    // Athletes list (most common)
    () => import('../features/coach-athletes').then((m) => ({ default: m.CoachAthleteHub })),
    () => import('../features/coach-athlete-list').then((m) => ({ default: m.CoachAthleteList })),

    // Coach hub pages
    () => import('../features/coach-hub-pages').then((m) => ({ default: m.CoachSpillereHub })),
    () => import('../features/coach-hub-pages').then((m) => ({ default: m.CoachAnalyseHub })),

    // Calendar
    () => import('../features/calendar/CoachCalendarPage'),
  ];
}

/**
 * Admin routes - most likely navigation paths
 */
function getAdminRoutes(): RouteLoader[] {
  return [
    // System overview
    () => import('../features/admin-system-overview').then((m) => ({ default: m.AdminSystemOverview })),

    // Coach management
    () => import('../features/admin-coach-management').then((m) => ({ default: m.AdminCoachManagement })),

    // Tier management
    () => import('../features/admin-tier-management').then((m) => ({ default: m.AdminTierManagement })),
  ];
}

/**
 * Prefetch routes based on current location
 * Predicts likely next navigation based on where user is now
 */
export function prefetchByLocation(
  pathname: string,
  role: string
): () => void {
  const nextRoutes = predictNextRoutes(pathname, role);

  if (nextRoutes.length === 0) {
    return () => {};
  }

  // Prefetch after short delay
  const timer = setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        prefetchRoutes(nextRoutes);
      });
    } else {
      prefetchRoutes(nextRoutes);
    }
  }, 1000);

  return () => clearTimeout(timer);
}

/**
 * Predict likely next routes based on current location
 */
function predictNextRoutes(pathname: string, role: string): RouteLoader[] {
  // Player navigation patterns
  if (role === 'player') {
    if (pathname === '/dashboard' || pathname === '/') {
      // From dashboard, likely to go to training or plan
      return [
        () => import('../features/hub-pages/TreningHub'),
        () => import('../features/hub-pages/PlanHub'),
        () => import('../features/calendar/CalendarPage'),
      ];
    }

    if (pathname.startsWith('/plan')) {
      // From plan pages, likely to view calendar or goals
      return [
        () => import('../features/calendar/CalendarPage'),
        () => import('../features/goals/GoalsPage'),
      ];
    }

    if (pathname.startsWith('/trening')) {
      // From training, likely to log session or view stats
      return [
        () => import('../features/sessions/SessionCreateFormContainer'),
        () => import('../features/training/TrainingStatsDashboard'),
      ];
    }
  }

  // Coach navigation patterns
  if (role === 'coach') {
    if (pathname === '/coach/dashboard' || pathname === '/coach') {
      // From dashboard, likely to view athletes
      return [
        () => import('../features/coach-athlete-list').then((m) => ({ default: m.CoachAthleteList })),
        () => import('../features/calendar/CoachCalendarPage'),
      ];
    }

    if (pathname.startsWith('/coach/athletes')) {
      // From athletes list, likely to view detail or create note
      return [
        () => import('../features/coach-athlete-detail').then((m) => ({ default: m.CoachAthleteDetail })),
        () => import('../features/coach-notes').then((m) => ({ default: m.CoachNotes })),
      ];
    }
  }

  // Admin navigation patterns
  if (role === 'admin') {
    if (pathname === '/admin' || pathname === '/admin/system') {
      // From admin home, likely to manage coaches or tiers
      return [
        () => import('../features/admin-coach-management').then((m) => ({ default: m.AdminCoachManagement })),
        () => import('../features/admin-tier-management').then((m) => ({ default: m.AdminTierManagement })),
      ];
    }
  }

  return [];
}

/**
 * React hook for automatic route prefetching
 *
 * @example
 * function App() {
 *   const { user } = useAuth();
 *   const location = useLocation();
 *
 *   usePrefetch(user?.role, location.pathname);
 *
 *   return <Routes>...</Routes>;
 * }
 */
export function usePrefetch(role?: string, pathname?: string): void {
  const [hasPrefetched, setHasPrefetched] = React.useState(false);

  React.useEffect(() => {
    if (!role || hasPrefetched) return;

    // Prefetch role routes on mount
    const cleanup1 = prefetchRoutesForRole(role, { delay: 2000 });
    setHasPrefetched(true);

    return cleanup1;
  }, [role, hasPrefetched]);

  React.useEffect(() => {
    if (!role || !pathname) return;

    // Prefetch location-based routes on navigation
    const cleanup = prefetchByLocation(pathname, role);
    return cleanup;
  }, [pathname, role]);
}

// Re-export React for the hook
import React from 'react';
