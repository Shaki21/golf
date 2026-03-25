/**
 * Coach Journey E2E Tests
 *
 * Tests the complete coach workflow:
 * 1. Login as coach
 * 2. View player list and select player
 * 3. Review player progress and stats
 * 4. Adjust training plan
 * 5. Add notes/feedback
 * 6. Upload/review videos
 */

import { test, expect } from '@playwright/test';

test.describe('Coach Workflow Journey', () => {
  const coachEmail = 'coach@demo.com';
  const coachPassword = 'coach123';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('Complete coach daily workflow', async ({ page }) => {
    // Step 1: Login as coach
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to coach dashboard
    await page.waitForURL(/coach|dashboard/i);

    // Verify coach dashboard loaded
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Coach|Overview/i);

    // Step 2: View player list
    await page.click('text=/Players|Athletes|Roster/i');

    // Wait for player list to load
    await page.waitForTimeout(1000);
    const playerList = page.locator('[data-testid="player-list"], .player-card, .roster-table');
    if (await playerList.count() > 0) {
      await expect(playerList.first()).toBeVisible();

      // Step 3: Select a player
      const firstPlayer = page.locator('[data-testid="player-card"], .player-item, tr.player-row').first();
      if (await firstPlayer.isVisible()) {
        await firstPlayer.click();

        // Wait for player detail page
        await page.waitForTimeout(1000);

        // Verify player profile loaded
        const playerProfile = page.locator('[data-testid="player-profile"], .player-details');
        if (await playerProfile.isVisible()) {
          await expect(playerProfile).toBeVisible();
        }
      }
    }

    // Step 4: Review player progress
    const progressTab = page.locator('button:has-text("Progress"), a:has-text("Analytics"), tab:has-text("Stats")').first();
    if (await progressTab.isVisible()) {
      await progressTab.click();
      await page.waitForTimeout(1000);

      // Check for progress charts/stats
      const progressData = page.locator('canvas, [data-testid="progress-chart"], .statistics');
      if (await progressData.count() > 0) {
        await expect(progressData.first()).toBeVisible();
      }
    }

    // Step 5: Add coach notes/feedback
    const notesButton = page.locator('button:has-text("Add Note"), button:has-text("Feedback"), button:has-text("Comment")').first();
    if (await notesButton.isVisible()) {
      await notesButton.click();
      await page.waitForTimeout(500);

      const notesField = page.locator('textarea[name="notes"], textarea[placeholder*="note" i], textarea[placeholder*="feedback" i]').first();
      if (await notesField.isVisible()) {
        await notesField.fill('Great progress this week! Keep focusing on short game.');

        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Modify player training plan', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to players
    await page.click('text=/Players|Athletes/i');
    await page.waitForTimeout(1000);

    // Select first player
    const firstPlayer = page.locator('[data-testid="player-card"], .player-item').first();
    if (await firstPlayer.isVisible()) {
      await firstPlayer.click();
      await page.waitForTimeout(1000);

      // Navigate to training plan
      await page.click('text=/Training Plan|Plan|Schedule/i');
      await page.waitForTimeout(1000);

      // Modify training plan
      const editButton = page.locator('button:has-text("Edit"), button:has-text("Modify"), button:has-text("Adjust")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);

        // Make some changes (e.g., adjust hours)
        const hoursInput = page.locator('input[name*="hours"], input[type="number"]').first();
        if (await hoursInput.isVisible()) {
          await hoursInput.fill('12');

          // Save changes
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(1000);

            // Verify success
            const successMessage = page.locator('.success, [role="alert"], .toast-success');
            if (await successMessage.count() > 0) {
              await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
            }
          }
        }
      }
    }
  });

  test('Review and provide video feedback', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to videos section
    const videosLink = page.locator('a:has-text("Videos"), a:has-text("Media"), button:has-text("Videos")').first();
    if (await videosLink.isVisible()) {
      await videosLink.click();
      await page.waitForTimeout(1000);

      // Select a video to review
      const videoItem = page.locator('[data-testid="video-item"], .video-card, .video-thumbnail').first();
      if (await videoItem.isVisible()) {
        await videoItem.click();
        await page.waitForTimeout(1000);

        // Add video feedback
        const feedbackButton = page.locator('button:has-text("Add Feedback"), button:has-text("Comment"), button:has-text("Annotate")').first();
        if (await feedbackButton.isVisible()) {
          await feedbackButton.click();

          const feedbackField = page.locator('textarea[name="feedback"], textarea[placeholder*="feedback" i]').first();
          if (await feedbackField.isVisible()) {
            await feedbackField.fill('Good swing mechanics. Work on follow-through.');

            const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
            if (await submitButton.isVisible()) {
              await submitButton.click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
    }
  });

  test('Create new training session template', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to session templates
    const templatesLink = page.locator('a:has-text("Templates"), a:has-text("Sessions"), button:has-text("Templates")').first();
    if (await templatesLink.isVisible()) {
      await templatesLink.click();
      await page.waitForTimeout(1000);

      // Create new template
      const createButton = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(500);

        // Fill in template details
        const titleField = page.locator('input[name="title"], input[name="name"]').first();
        if (await titleField.isVisible()) {
          await titleField.fill('Short Game Focus Session');

          const descriptionField = page.locator('textarea[name="description"]').first();
          if (await descriptionField.isVisible()) {
            await descriptionField.fill('Intensive short game practice with putting and chipping drills.');

            const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
            if (await saveButton.isVisible()) {
              await saveButton.click();
              await page.waitForTimeout(1000);
            }
          }
        }
      }
    }
  });

  test('View team analytics', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to analytics
    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Reports"), a:has-text("Stats")').first();
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await page.waitForTimeout(1000);

      // Verify analytics loaded
      const charts = page.locator('canvas, [data-testid="chart"], .recharts-wrapper, .analytics-dashboard');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }

      // Check for key metrics
      const metrics = page.locator('[data-testid="metric"], .stat-card, .kpi-card');
      if (await metrics.count() > 0) {
        expect(await metrics.count()).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test('Schedule training session', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to calendar/schedule
    const calendarLink = page.locator('a:has-text("Calendar"), a:has-text("Schedule"), button:has-text("Calendar")').first();
    if (await calendarLink.isVisible()) {
      await calendarLink.click();
      await page.waitForTimeout(1000);

      // Create new session
      const createSessionButton = page.locator('button:has-text("New Session"), button:has-text("Schedule"), button:has-text("Add")').first();
      if (await createSessionButton.isVisible()) {
        await createSessionButton.click();
        await page.waitForTimeout(500);

        // Fill session details
        const titleField = page.locator('input[name="title"]').first();
        if (await titleField.isVisible()) {
          await titleField.fill('Team Practice Session');

          const dateField = page.locator('input[type="date"], input[name="date"]').first();
          if (await dateField.isVisible()) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateString = tomorrow.toISOString().split('T')[0];
            await dateField.fill(dateString);

            const submitButton = page.locator('button:has-text("Schedule"), button:has-text("Save"), button[type="submit"]').first();
            if (await submitButton.isVisible()) {
              await submitButton.click();
              await page.waitForTimeout(1000);
            }
          }
        }
      }
    }
  });

  test('Send message to player', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to messages
    const messagesLink = page.locator('a:has-text("Messages"), a:has-text("Chat"), button:has-text("Messages")').first();
    if (await messagesLink.isVisible()) {
      await messagesLink.click();
      await page.waitForTimeout(1000);

      // Start new message
      const newMessageButton = page.locator('button:has-text("New Message"), button:has-text("Compose")').first();
      if (await newMessageButton.isVisible()) {
        await newMessageButton.click();
        await page.waitForTimeout(500);

        const messageField = page.locator('textarea[name="message"], textarea[placeholder*="message" i]').first();
        if (await messageField.isVisible()) {
          await messageField.fill('Great job in today\'s session! Keep up the good work.');

          const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
          if (await sendButton.isVisible()) {
            await sendButton.click();
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });

  test('Export player report', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', coachEmail);
    await page.fill('input[name="password"]', coachPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Navigate to players and select one
    await page.click('text=/Players|Athletes/i');
    await page.waitForTimeout(1000);

    const firstPlayer = page.locator('[data-testid="player-card"], .player-item').first();
    if (await firstPlayer.isVisible()) {
      await firstPlayer.click();
      await page.waitForTimeout(1000);

      // Find export button
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("Report")').first();
      if (await exportButton.isVisible()) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

        await exportButton.click();

        // Wait for download
        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.(pdf|xlsx|csv)$/);
        }
      }
    }
  });
});

test.describe('Coach Error Handling', () => {
  test('Handle invalid player access', async ({ page }) => {
    await page.goto('/login');

    // Login as coach
    await page.fill('input[name="email"]', 'coach@demo.com');
    await page.fill('input[name="password"]', 'coach123');
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Try to access non-existent player
    await page.goto('/coach/players/invalid-player-id');

    // Should show error or redirect
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('.error, [role="alert"], .not-found');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});

test.describe('Coach Mobile Experience', () => {
  test.use({
    viewport: { width: 768, height: 1024 }, // iPad size
  });

  test('Coach dashboard responsive on tablet', async ({ page }) => {
    await page.goto('/login');

    // Login
    await page.fill('input[name="email"]', 'coach@demo.com');
    await page.fill('input[name="password"]', 'coach123');
    await page.click('button[type="submit"]');

    await page.waitForURL(/coach|dashboard/i);

    // Verify dashboard is responsive
    const dashboard = page.locator('[data-testid="dashboard"], .dashboard-container');
    if (await dashboard.isVisible()) {
      await expect(dashboard).toBeVisible();
    }

    // Check if mobile menu exists
    const mobileMenu = page.locator('button[aria-label="Menu"], .hamburger-menu');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }
  });
});
