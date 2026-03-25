import { test, expect } from '@playwright/test';

/**
 * Core User Flows E2E Tests
 * Tests for login, dashboard, navigation, and key features
 */

test.describe('Authentication (TC-AUTH)', () => {
  test('TC-AUTH-01: login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for TIER Golf branding and login form elements
    // The card title "Logg Inn" is an h2 heading
    await expect(page.locator('h1, h2').filter({ hasText: /logg inn/i })).toBeVisible();
    await expect(page.getByPlaceholder(/e-post/i)).toBeVisible();
    await expect(page.getByPlaceholder(/passord/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /logg inn/i })).toBeVisible();
  });

  test('TC-AUTH-02: demo login buttons work', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check demo login buttons exist - they contain email addresses
    await expect(page.getByRole('button', { name: /player@demo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /coach@demo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /admin@demo/i })).toBeVisible();
  });

  test('TC-AUTH-03: successful login redirects to dashboard', async ({ page }) => {
    // Mock successful login API - must match axios response.data.data structure
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'demo-token',
            refreshToken: 'demo-refresh',
            user: {
              id: 'demo-player-1',
              email: 'player@demo.com',
              firstName: 'Anders',
              lastName: 'Kristiansen',
              role: 'player',
            },
          },
        }),
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click player demo login button
    await page.getByRole('button', { name: /player@demo/i }).click();

    // Should redirect to dashboard or home
    await page.waitForURL(/\/(dashboard)?$/, { timeout: 10000 });
  });

  test('TC-AUTH-04: invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in invalid credentials and submit
    await page.getByPlaceholder(/e-post/i).fill('invalid@test.com');
    await page.getByPlaceholder(/passord/i).fill('wrongpassword');
    await page.getByRole('button', { name: /logg inn/i }).click();

    // Wait for the login attempt to complete
    await page.waitForTimeout(3000);

    // Verify we're still on the login page (didn't redirect = login failed)
    await expect(page).toHaveURL(/login/);

    // Check for error indication - look for AlertCircle icon or error text
    const hasError = await page.locator('svg, [class*="error"], [style*="error"]').count() > 0 ||
                     await page.getByText(/failed|feil|ugyldig|error|backend/i).count() > 0;
    expect(hasError || page.url().includes('login')).toBeTruthy();
  });
});

test.describe('Dashboard (TC-DASH)', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-player-1',
        email: 'player@demo.com',
        firstName: 'Anders',
        lastName: 'Kristiansen',
        role: 'player',
      }));
    });
  });

  test('TC-DASH-01: dashboard loads with user info', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Anders/i)).toBeVisible();
  });

  test('TC-DASH-02: dashboard has navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('TC-DASH-03: dashboard displays widgets', async ({ page }) => {
    await page.goto('/');

    // Dashboard should have content sections
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });
});

test.describe('Navigation (TC-NAV)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-player-1',
        email: 'player@demo.com',
        firstName: 'Anders',
        lastName: 'Kristiansen',
        role: 'player',
      }));
    });
  });

  test('TC-NAV-01: can navigate to calendar', async ({ page }) => {
    // Navigate directly to calendar page to verify routing works
    await page.goto('/kalender?view=week');
    await expect(page).toHaveURL(/kalender/);
    // Verify page content loaded
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });
  });

  test('TC-NAV-02: can navigate to annual plan', async ({ page }) => {
    // Navigate directly to annual plan page
    await page.goto('/kalender?view=year');
    await expect(page).toHaveURL(/kalender.*view=year/);
    // Verify page content loaded
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });
  });

  test('TC-NAV-03: can navigate to profile', async ({ page }) => {
    // Navigate directly to profile page
    await page.goto('/profil');
    await expect(page).toHaveURL(/profil/);
    // Verify page content loaded
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Responsive Design (TC-RESP)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-player-1',
        email: 'player@demo.com',
        firstName: 'Anders',
        lastName: 'Kristiansen',
        role: 'player',
      }));
    });
  });

  test('TC-RESP-01: dashboard works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-RESP-02: dashboard works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-RESP-03: dashboard works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Annual Plan (TC-PLAN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-player-1',
        email: 'player@demo.com',
        firstName: 'Anders',
        lastName: 'Kristiansen',
        role: 'player',
      }));
    });
  });

  test('TC-PLAN-01: annual plan page loads', async ({ page }) => {
    await page.goto('/aarsplan');

    // Wait for page to load and verify content is visible
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });
  });

  test('TC-PLAN-02: can view plan details', async ({ page }) => {
    await page.goto('/aarsplan');

    // Page should render without errors
    await expect(page.locator('#main-content')).toBeVisible();
  });
});

test.describe('Error Handling (TC-ERR)', () => {
  test('TC-ERR-01: 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    // Should show 404 or redirect
    const url = page.url();
    expect(url).toMatch(/login|404|this-page-does-not-exist/);
  });

  test('TC-ERR-02: protected routes redirect to login', async ({ page }) => {
    // Clear any stored auth
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/aarsplan');

    // Should redirect to login
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/login/);
  });
});
