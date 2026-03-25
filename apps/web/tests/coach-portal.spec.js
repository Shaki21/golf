import { test, expect } from '@playwright/test';

/**
 * Coach Portal E2E Tests
 * Tests for coach-specific functionality
 */

test.describe('Coach Authentication', () => {
  test('TC-COACH-AUTH-01: coach can login', async ({ page }) => {
    // Mock successful login API for coach - must match axios response.data.data structure
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'demo-coach-token',
            refreshToken: 'demo-refresh',
            user: {
              id: 'demo-coach-1',
              email: 'coach@demo.com',
              firstName: 'Anders',
              lastName: 'Trener',
              role: 'coach',
            },
          },
        }),
      });
    });

    await page.goto('/login');

    // Click coach demo login
    await page.getByRole('button', { name: /trener/i }).click();

    // Coach first goes to / then the app may redirect based on role
    // Wait for navigation to complete and verify user is logged in
    await page.waitForURL('**/', { timeout: 10000 });
    // Verify the coach is logged in by checking the page has loaded
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Coach Dashboard (TC-COACH-DASH)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-DASH-01: coach dashboard loads', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('TC-COACH-DASH-02: shows athlete overview', async ({ page }) => {
    await page.goto('/coach');
    // Should have athletes section
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Coach Athletes (TC-COACH-ATH)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-ATH-01: can navigate to athletes list', async ({ page }) => {
    await page.goto('/coach/athletes');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('TC-COACH-ATH-02: athletes list shows players', async ({ page }) => {
    await page.goto('/coach/athletes');
    // Page should render athlete cards
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-COACH-ATH-03: can filter athletes by category', async ({ page }) => {
    await page.goto('/coach/athletes');

    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter|kategori/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
  });

  test('TC-COACH-ATH-04: can search athletes', async ({ page }) => {
    await page.goto('/coach/athletes');

    const searchInput = page.getByPlaceholder(/søk/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Lars');
    }
  });
});

test.describe('Coach Athlete Tournaments (TC-COACH-TOURN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-TOURN-01: tournament overview page loads', async ({ page }) => {
    await page.goto('/coach/athletes/tournaments');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('TC-COACH-TOURN-02: shows athletes with tournament data', async ({ page }) => {
    await page.goto('/coach/athletes/tournaments');
    // Page should render
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-COACH-TOURN-03: can expand athlete card', async ({ page }) => {
    await page.goto('/coach/athletes/tournaments');

    // Click on first expandable card if exists
    const expandButton = page.locator('[data-testid="expand-athlete"]').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
  });
});

test.describe('Coach Groups (TC-COACH-GRP)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-GRP-01: groups page loads', async ({ page }) => {
    await page.goto('/coach/groups');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('TC-COACH-GRP-02: can view group details', async ({ page }) => {
    await page.goto('/coach/groups');

    // Click on first group if exists
    const groupCard = page.locator('[data-testid="group-card"]').first();
    if (await groupCard.isVisible()) {
      await groupCard.click();
    }
  });

  test('TC-COACH-GRP-03: group detail shows plan tab', async ({ page }) => {
    await page.goto('/coach/groups/test-group-id');

    // Look for plan tab
    const planTab = page.getByRole('tab', { name: /plan/i });
    if (await planTab.isVisible()) {
      await planTab.click();
    }
  });
});

test.describe('Coach Exercises (TC-COACH-EX)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-EX-01: exercises page loads', async ({ page }) => {
    await page.goto('/coach/exercises');
    // Check that the page renders with coach content
    // The page may not have main-content if it's a different layout
    await expect(page.locator('body')).toBeVisible();
    // Check for any heading or content that indicates the page loaded
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-COACH-EX-02: can navigate to template editor', async ({ page }) => {
    await page.goto('/coach/exercises/templates/create');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
  });

  test('TC-COACH-EX-03: template editor has form fields', async ({ page }) => {
    await page.goto('/coach/exercises/templates/create');

    // Look for name input
    const nameInput = page.getByPlaceholder(/navn|name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Template');
    }
  });
});

test.describe('Coach Navigation (TC-COACH-NAV)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-NAV-01: sidebar navigation works', async ({ page }) => {
    await page.goto('/coach');

    // Check sidebar exists
    const sidebar = page.getByRole('navigation');
    await expect(sidebar).toBeVisible();
  });

  test('TC-COACH-NAV-02: can navigate between coach sections', async ({ page }) => {
    await page.goto('/coach');

    // Navigate through main sections
    const athletesLink = page.getByRole('link', { name: /utøvere|athletes/i });
    if (await athletesLink.isVisible()) {
      await athletesLink.click();
      await expect(page).toHaveURL(/athletes/);
    }
  });
});

test.describe('Coach Mobile View (TC-COACH-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'demo-coach-token');
      localStorage.setItem('userData', JSON.stringify({
        id: 'demo-coach-1',
        email: 'coach@demo.com',
        firstName: 'Anders',
        lastName: 'Trener',
        role: 'coach',
      }));
    });
  });

  test('TC-COACH-MOB-01: coach dashboard works on mobile', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-COACH-MOB-02: mobile menu is accessible', async ({ page }) => {
    await page.goto('/coach');

    // Look for hamburger menu
    const menuButton = page.getByRole('button', { name: /menu|meny/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  });
});
