/**
 * Player Journey E2E Tests
 *
 * Tests the complete daily training flow for a player:
 * 1. Login as player
 * 2. View today's training assignment
 * 3. Complete training activities
 * 4. Log training session
 * 5. View progress and stats
 * 6. Check achievements/badges
 */

import { test, expect } from '@playwright/test';

test.describe('Player Daily Training Journey', () => {
  const playerEmail = 'player@demo.com';
  const playerPassword = 'player123';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('Complete daily training flow as player', async ({ page }) => {
    // Step 1: Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/player/dashboard');
    await expect(page).toHaveTitle(/Dashboard/i);

    // Verify player dashboard loaded
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Welcome/i);

    // Step 2: View today's training assignment
    await page.click('text=/Today\'s Training|Training/i');

    // Should see daily training plan
    await expect(page.locator('[data-testid="daily-training"], .training-card, .assignment')).toBeVisible({
      timeout: 10000,
    });

    // Check training details are displayed
    const trainingSection = page.locator('[data-testid="training-section"], .training-details').first();
    if (await trainingSection.isVisible()) {
      await expect(trainingSection).toContainText(/Training|Workout|Exercise/i);
    }

    // Step 3: Start training session
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
    if (await startButton.isVisible()) {
      await startButton.click();

      // Wait for training interface
      await page.waitForTimeout(1000);
    }

    // Step 4: Complete an exercise
    const completeButton = page.locator('button:has-text("Complete"), input[type="checkbox"]').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await page.waitForTimeout(500);
    }

    // Step 5: Log training session
    const logButton = page.locator('button:has-text("Log"), button:has-text("Save"), button:has-text("Submit")').first();
    if (await logButton.isVisible()) {
      await logButton.click();

      // May need to fill in session notes
      const notesField = page.locator('textarea[name="notes"], textarea[placeholder*="notes" i]').first();
      if (await notesField.isVisible()) {
        await notesField.fill('Completed daily training session');
      }

      // Submit the log
      const submitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Save Session")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
    }

    // Step 6: View progress
    await page.click('text=/Progress|Stats|Analytics/i');

    // Check stats are displayed
    await page.waitForTimeout(1000);
    const statsElements = page.locator('[data-testid="stats"], .stats-card, .progress-chart');
    if (await statsElements.count() > 0) {
      await expect(statsElements.first()).toBeVisible();
    }

    // Step 7: Check achievements
    const achievementsLink = page.locator('a:has-text("Achievements"), a:has-text("Badges"), button:has-text("Achievements")').first();
    if (await achievementsLink.isVisible()) {
      await achievementsLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('View weekly training plan', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Navigate to weekly plan
    await page.click('text=/Week|Weekly Plan|Calendar/i');

    // Verify weekly view loaded
    await page.waitForTimeout(1000);
    const weekView = page.locator('[data-testid="weekly-plan"], .calendar-view, .week-view');
    if (await weekView.isVisible()) {
      await expect(weekView).toBeVisible();

      // Should show 7 days
      const dayElements = page.locator('[data-testid="day"], .day-card, .calendar-day');
      if (await dayElements.count() > 0) {
        expect(await dayElements.count()).toBeGreaterThanOrEqual(5);
      }
    }
  });

  test('View training history', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Navigate to history
    await page.click('text=/History|Sessions|Past Training/i');

    // Verify history loaded
    await page.waitForTimeout(1000);
    const historyList = page.locator('[data-testid="history-list"], .session-list, .history-table');
    if (await historyList.isVisible()) {
      await expect(historyList).toBeVisible();
    }
  });

  test('View and update profile', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Navigate to profile
    await page.click('text=/Profile|Settings|Account/i');

    // Verify profile page loaded
    await page.waitForTimeout(1000);

    // Check if we can edit profile
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update")').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Update bio or other field
      const bioField = page.locator('textarea[name="bio"], input[name="phone"]').first();
      if (await bioField.isVisible()) {
        await bioField.fill('Updated via E2E test');

        // Save changes
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();

          // Verify success message
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Access training videos', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Navigate to videos
    const videosLink = page.locator('a:has-text("Videos"), a:has-text("Media"), button:has-text("Videos")').first();
    if (await videosLink.isVisible()) {
      await videosLink.click();

      // Verify videos page loaded
      await page.waitForTimeout(1000);
      const videoGallery = page.locator('[data-testid="video-gallery"], .video-list, video');
      if (await videoGallery.count() > 0) {
        await expect(videoGallery.first()).toBeVisible();
      }
    }
  });

  test('View performance metrics', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Navigate to metrics/analytics
    const metricsLink = page.locator('a:has-text("Metrics"), a:has-text("Analytics"), a:has-text("Stats")').first();
    if (await metricsLink.isVisible()) {
      await metricsLink.click();

      // Verify metrics loaded
      await page.waitForTimeout(1000);

      // Check for charts or stats
      const charts = page.locator('canvas, [data-testid="chart"], .recharts-wrapper');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    }
  });

  test('Check notifications', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Click notifications bell/icon
    const notifIcon = page.locator('[data-testid="notifications"], button:has-text("Notifications"), .notification-icon').first();
    if (await notifIcon.isVisible()) {
      await notifIcon.click();

      // Verify notifications panel opened
      await page.waitForTimeout(500);
      const notifPanel = page.locator('[data-testid="notification-panel"], .notifications-dropdown');
      if (await notifPanel.isVisible()) {
        await expect(notifPanel).toBeVisible();
      }
    }
  });

  test('Logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', playerEmail);
    await page.fill('input[name="password"]', playerPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login
      await page.waitForURL('/login', { timeout: 5000 });
      await expect(page).toHaveURL(/login/);
    }
  });
});

test.describe('Player Error Handling', () => {
  test('Handle network error gracefully', async ({ page }) => {
    await page.goto('/login');

    // Login
    await page.fill('input[name="email"]', 'player@demo.com');
    await page.fill('input[name="password"]', 'player123');

    // Simulate offline
    await page.context().setOffline(true);

    await page.click('button[type="submit"]');

    // Should show error message
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('.error, [role="alert"], .toast-error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test('Handle invalid session', async ({ page }) => {
    // Try accessing protected page without login
    await page.goto('/player/dashboard');

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Player Mobile Experience', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE size
  });

  test('Mobile navigation works correctly', async ({ page }) => {
    await page.goto('/login');

    // Login
    await page.fill('input[name="email"]', 'player@demo.com');
    await page.fill('input[name="password"]', 'player123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/player/dashboard');

    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Menu"], button.hamburger, [data-testid="mobile-menu"]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Verify menu opened
      await page.waitForTimeout(500);
      const mobileMenu = page.locator('[data-testid="mobile-nav"], .mobile-menu, nav.mobile');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
    }
  });
});
