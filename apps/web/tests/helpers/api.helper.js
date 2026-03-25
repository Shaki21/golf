/**
 * API Mocking Test Helpers
 *
 * Reusable helpers for mocking API responses in E2E tests
 */

/**
 * Mock API endpoints with custom responses
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} mocks - Object mapping endpoints to response data
 *
 * @example
 * await mockAPI(page, {
 *   '/api/v1/goals': { data: [] },
 *   '/api/v1/players/me': { data: playerData },
 * });
 */
export async function mockAPI(page, mocks) {
  for (const [endpoint, responseData] of Object.entries(mocks)) {
    await page.route(`**${endpoint}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });
  }
}

/**
 * Mock a successful API response
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} endpoint
 * @param {any} data
 * @param {number} status
 */
export async function mockSuccess(page, endpoint, data, status = 200) {
  await page.route(`**${endpoint}*`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data,
      }),
    });
  });
}

/**
 * Mock a failed API response
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} endpoint
 * @param {string} errorMessage
 * @param {number} status
 */
export async function mockError(page, endpoint, errorMessage, status = 400) {
  await page.route(`**${endpoint}*`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: errorMessage,
      }),
    });
  });
}

/**
 * Mock network timeout
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} endpoint
 * @param {number} delay - Delay in milliseconds before timeout
 */
export async function mockTimeout(page, endpoint, delay = 5000) {
  await page.route(`**${endpoint}*`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.abort('timedout');
  });
}

/**
 * Mock slow API response (for testing loading states)
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} endpoint
 * @param {any} data
 * @param {number} delay - Delay in milliseconds
 */
export async function mockSlowResponse(page, endpoint, data, delay = 2000) {
  await page.route(`**${endpoint}*`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data,
      }),
    });
  });
}

/**
 * Mock goals API
 *
 * @param {import('@playwright/test').Page} page
 * @param {Array} goals
 */
export async function mockGoalsAPI(page, goals = []) {
  await mockSuccess(page, '/api/v1/goals', { data: goals });
}

/**
 * Mock sessions API
 *
 * @param {import('@playwright/test').Page} page
 * @param {Array} sessions
 */
export async function mockSessionsAPI(page, sessions = []) {
  await mockSuccess(page, '/api/v1/sessions', { data: sessions });
}

/**
 * Mock player profile API
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} playerData
 */
export async function mockPlayerProfileAPI(page, playerData) {
  await mockSuccess(page, '/api/v1/players/me', playerData);
}

/**
 * Mock coach athletes API
 *
 * @param {import('@playwright/test').Page} page
 * @param {Array} athletes
 */
export async function mockCoachAthletesAPI(page, athletes = []) {
  await mockSuccess(page, '/api/v1/coaches/me/athletes', { data: athletes });
}

/**
 * Mock achievements/badges API
 *
 * @param {import('@playwright/test').Page} page
 * @param {Array} achievements
 * @param {Array} badges
 */
export async function mockAchievementsAPI(page, achievements = [], badges = []) {
  await mockSuccess(page, '/api/v1/achievements', { data: achievements });
  await mockSuccess(page, '/api/v1/badges/progress', { data: badges });
}

/**
 * Intercept and log API calls (for debugging)
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} pattern - URL pattern to intercept (e.g., '**/api/**')
 */
export async function interceptAPI(page, pattern = '**/api/**') {
  await page.route(pattern, async (route) => {
    const request = route.request();
    console.log(`[API] ${request.method()} ${request.url()}`);

    // Continue with the actual request
    await route.continue();
  });
}

/**
 * Wait for specific API call to complete
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} endpoint
 * @param {number} timeout
 * @returns {Promise<object>} Response data
 */
export async function waitForAPI(page, endpoint, timeout = 10000) {
  const response = await page.waitForResponse(
    (response) => response.url().includes(endpoint) && response.status() === 200,
    { timeout }
  );

  return await response.json();
}

/**
 * Mock all common APIs with empty data (for testing empty states)
 *
 * @param {import('@playwright/test').Page} page
 */
export async function mockEmptyAPIs(page) {
  await mockAPI(page, {
    '/api/v1/goals': { data: [] },
    '/api/v1/sessions': { data: [] },
    '/api/v1/tests': { data: [] },
    '/api/v1/achievements': { data: [] },
    '/api/v1/badges/progress': { data: [] },
    '/api/v1/tournaments': { data: [] },
  });
}

/**
 * Create sample data for testing
 */
export const SAMPLE_DATA = {
  goal: {
    id: 'goal-1',
    title: 'Test Goal',
    description: 'This is a test goal',
    status: 'active',
    deadline: '2026-12-31',
    playerId: 'player-1',
    createdAt: '2026-01-01',
  },

  session: {
    id: 'session-1',
    type: 'practice',
    duration: 60,
    date: '2026-01-10',
    playerId: 'player-1',
    notes: 'Test session',
  },

  athlete: {
    id: 'athlete-1',
    firstName: 'Test',
    lastName: 'Athlete',
    email: 'athlete@test.com',
    category: 'A',
    handicap: 5.4,
  },

  achievement: {
    id: 'achievement-1',
    title: 'Test Achievement',
    description: 'Test achievement description',
    earnedAt: '2026-01-10',
    type: 'milestone',
  },
};
