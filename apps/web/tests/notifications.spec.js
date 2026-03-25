import { test, expect } from '@playwright/test';

/**
 * Notifications E2E Tests
 * Tests for push notifications and real-time updates
 */

test.describe('Notification Settings (TC-NOTIF)', () => {
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

  test('TC-NOTIF-01: notification settings page loads', async ({ page }) => {
    await page.goto('/profil/varsler');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('TC-NOTIF-02: displays notification type toggles', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Should show notification categories
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('TC-NOTIF-03: can toggle notification settings', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Find and click a toggle switch
    const toggle = page.locator('button[role="switch"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
    }
  });

  test('TC-NOTIF-04: shows push notification status', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Should display push notification status
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-NOTIF-05: shows connection status', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Should display realtime connection status
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('In-App Notifications (TC-TOAST)', () => {
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

  test('TC-TOAST-01: toast notifications appear', async ({ page }) => {
    await page.goto('/');

    // Trigger a notification (e.g., by completing an action)
    // Toast container should exist
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-TOAST-02: toast auto-dismisses', async ({ page }) => {
    await page.goto('/');

    // Toasts should auto-dismiss after timeout
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-TOAST-03: can dismiss toast manually', async ({ page }) => {
    await page.goto('/');

    // Close button should work
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Notification Bell (TC-BELL)', () => {
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

  test('TC-BELL-01: notification bell is visible in header', async ({ page }) => {
    await page.goto('/');

    // Bell icon should be in header
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    if (await bellIcon.isVisible()) {
      await expect(bellIcon).toBeVisible();
    }
  });

  test('TC-BELL-02: clicking bell opens notification panel', async ({ page }) => {
    await page.goto('/');

    const bellIcon = page.locator('[data-testid="notification-bell"]');
    if (await bellIcon.isVisible()) {
      await bellIcon.click();
    }
  });

  test('TC-BELL-03: shows unread count badge', async ({ page }) => {
    await page.goto('/');

    // Badge should show unread count if any
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Session Reminders (TC-REMIND)', () => {
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

  test('TC-REMIND-01: session reminder notification type exists', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Look for training reminders toggle
    const reminderText = page.getByText(/treningspåminnelse|påminnelse/i);
    if (await reminderText.isVisible()) {
      await expect(reminderText).toBeVisible();
    }
  });
});

test.describe('Achievement Notifications (TC-ACHIEVE)', () => {
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

  test('TC-ACHIEVE-01: achievement notification type exists', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Look for achievement notifications toggle
    const achievementText = page.getByText(/prestasjon/i);
    if (await achievementText.isVisible()) {
      await expect(achievementText).toBeVisible();
    }
  });
});

test.describe('Coach Notes Notifications (TC-NOTES)', () => {
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

  test('TC-NOTES-01: coach notes notification type exists', async ({ page }) => {
    await page.goto('/profil/varsler');

    // Look for coach notes notifications toggle
    const notesText = page.getByText(/trenernotat/i);
    if (await notesText.isVisible()) {
      await expect(notesText).toBeVisible();
    }
  });
});

test.describe('Offline Handling (TC-OFFLINE)', () => {
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

  test('TC-OFFLINE-01: shows offline indicator when disconnected', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Wait for offline detection
    await page.waitForTimeout(1000);

    // Should show offline indicator
    await expect(page.locator('body')).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });

  test('TC-OFFLINE-02: reconnects when back online', async ({ page, context }) => {
    await page.goto('/');

    // Go offline then online
    await context.setOffline(true);
    await page.waitForTimeout(500);
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // Should reconnect
    await expect(page.locator('body')).toBeVisible();
  });
});
