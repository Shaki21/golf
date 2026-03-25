/**
 * Authentication Test Helpers
 *
 * Reusable helpers for authentication in E2E tests
 */

/**
 * Demo user credentials
 */
export const DEMO_USERS = {
  player: {
    email: 'player@demo.com',
    password: 'demo123',
    role: 'player',
    id: '00000000-0000-0000-0000-000000000004',
    firstName: 'Demo',
    lastName: 'Player',
  },
  coach: {
    email: 'coach@demo.com',
    password: 'demo123',
    role: 'coach',
    id: '00000000-0000-0000-0000-000000000003',
    firstName: 'Demo',
    lastName: 'Coach',
  },
  admin: {
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    id: '00000000-0000-0000-0000-000000000001',
    firstName: 'System',
    lastName: 'Admin',
  },
};

/**
 * Set up authenticated session for a user
 *
 * @param {import('@playwright/test').Page} page
 * @param {'player' | 'coach' | 'admin'} userType
 */
export async function setupAuth(page, userType = 'player') {
  const user = DEMO_USERS[userType];

  await page.addInitScript((userData) => {
    localStorage.setItem('accessToken', 'demo-token');
    localStorage.setItem('userData', JSON.stringify(userData));
  }, user);
}

/**
 * Mock successful login API response
 *
 * @param {import('@playwright/test').Page} page
 * @param {'player' | 'coach' | 'admin'} userType
 */
export async function mockLoginAPI(page, userType = 'player') {
  const user = DEMO_USERS[userType];

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          accessToken: 'demo-token',
          refreshToken: 'demo-refresh',
          user,
        },
      }),
    });
  });
}

/**
 * Mock failed login API response
 *
 * @param {import('@playwright/test').Page} page
 */
export async function mockLoginFailure(page) {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'Invalid credentials',
      }),
    });
  });
}

/**
 * Login using the demo button
 *
 * @param {import('@playwright/test').Page} page
 * @param {'player' | 'coach' | 'admin'} userType
 */
export async function loginWithDemoButton(page, userType = 'player') {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Click appropriate demo button
  const buttonText = DEMO_USERS[userType].email;
  await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();

  // Wait for redirect
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 10000 });
}

/**
 * Login using email/password form
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} password
 */
export async function loginWithForm(page, email, password) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder(/e-post/i).fill(email);
  await page.getByPlaceholder(/passord/i).fill(password);
  await page.getByRole('button', { name: /logg inn/i }).click();
}

/**
 * Logout the current user
 *
 * @param {import('@playwright/test').Page} page
 */
export async function logout(page) {
  // Open user menu (typically in header)
  await page.getByRole('button', { name: /profil|meny|menu/i }).click();

  // Click logout
  await page.getByRole('menuitem', { name: /logg ut|logout/i }).click();

  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Check if user is authenticated
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated(page) {
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  return !!token;
}

/**
 * Get current user data from localStorage
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser(page) {
  const userData = await page.evaluate(() => localStorage.getItem('userData'));
  return userData ? JSON.parse(userData) : null;
}

/**
 * Clear authentication
 *
 * @param {import('@playwright/test').Page} page
 */
export async function clearAuth(page) {
  await page.evaluate(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  });
}
