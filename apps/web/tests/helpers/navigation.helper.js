/**
 * Navigation Test Helpers
 *
 * Reusable helpers for navigation in E2E tests
 */

/**
 * Common routes by role
 */
export const ROUTES = {
  player: {
    dashboard: '/',
    goals: '/plan/maal',
    calendar: '/plan/kalender',
    sessions: '/trening/okter',
    stats: '/analyse/statistikk',
    profile: '/mer/brukerprofil',
    training: '/trening',
    plan: '/plan',
    analyse: '/analyse',
    more: '/mer',
  },
  coach: {
    dashboard: '/coach',
    athletes: '/coach/athletes',
    calendar: '/coach/calendar',
    notes: '/coach/notes',
    groups: '/coach/groups',
    stats: '/coach/stats',
  },
  admin: {
    dashboard: '/admin',
    coaches: '/admin/coaches',
    system: '/admin/system',
    tiers: '/admin/tiers',
  },
};

/**
 * Navigate to a route and wait for it to load
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 * @param {object} options
 */
export async function navigateTo(page, path, options = {}) {
  const { waitForNetworkIdle = true, timeout = 10000 } = options;

  await page.goto(path, { timeout });

  if (waitForNetworkIdle) {
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Navigate using the main navigation menu
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} navItemText - Text of the nav item to click
 */
export async function navigateViaMenu(page, navItemText) {
  // Find and click the navigation item
  await page.getByRole('navigation').getByText(new RegExp(navItemText, 'i')).click();

  // Wait for navigation
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to player dashboard
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goToDashboard(page) {
  await navigateTo(page, ROUTES.player.dashboard);
}

/**
 * Navigate to goals page
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goToGoals(page) {
  await navigateTo(page, ROUTES.player.goals);
}

/**
 * Navigate to calendar page
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goToCalendar(page) {
  await navigateTo(page, ROUTES.player.calendar);
}

/**
 * Navigate to sessions page
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goToSessions(page) {
  await navigateTo(page, ROUTES.player.sessions);
}

/**
 * Navigate to coach dashboard
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goToCoachDashboard(page) {
  await navigateTo(page, ROUTES.coach.dashboard);
}

/**
 * Navigate to coach athletes page
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goToCoachAthletes(page) {
  await navigateTo(page, ROUTES.coach.athletes);
}

/**
 * Check if currently on a specific route
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function isOnRoute(page, path) {
  const url = page.url();
  return url.includes(path);
}

/**
 * Wait for route change
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} expectedPath
 * @param {number} timeout
 */
export async function waitForRoute(page, expectedPath, timeout = 10000) {
  await page.waitForURL(new RegExp(expectedPath), { timeout });
}

/**
 * Go back in browser history
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goBack(page) {
  await page.goBack();
  await page.waitForLoadState('networkidle');
}

/**
 * Go forward in browser history
 *
 * @param {import('@playwright/test').Page} page
 */
export async function goForward(page) {
  await page.goForward();
  await page.waitForLoadState('networkidle');
}

/**
 * Reload the current page
 *
 * @param {import('@playwright/test').Page} page
 */
export async function reload(page) {
  await page.reload();
  await page.waitForLoadState('networkidle');
}
