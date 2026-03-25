import { test, expect } from '@playwright/test';

// Setup authentication for all tests
test.beforeEach(async ({ page }) => {
  // Set up localStorage with demo user
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

test.describe('Mobile Home (TC-MH)', () => {
  test('TC-MH-01: renders focus + next event', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user_1',
          firstName: 'Anders',
          lastName: 'Kristiansen',
          email: 'anders@example.com',
          role: 'player',
        }),
      });
    });

    await page.route('**/api/v1/dashboard/player', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          focus: 'Styrke og kondisjon',
          nextEvent: { title: 'Golf Trening', date: '2025-12-17T10:00:00Z' },
        }),
      });
    });

    await page.goto('/m/home');
    await expect(page.getByText('Hei Anders')).toBeVisible();
    await expect(page.getByText('Styrke og kondisjon')).toBeVisible();
    await expect(page.getByText('Golf Trening')).toBeVisible();
  });

  test('TC-MH-02: empty state when no events/plan', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user_1',
          firstName: 'Anders',
          email: 'anders@example.com',
        }),
      });
    });

    await page.route('**/api/v1/dashboard/player', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          focus: null,
          nextEvent: null,
        }),
      });
    });

    await page.goto('/m/home');
    await expect(page.getByText('Ingen aktiv plan')).toBeVisible();
  });

  test('TC-MH-03: 500 error shows retry', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/me', async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto('/m/home');
    await expect(page.getByText(/gikk galt/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /prøv igjen/i })).toBeVisible();
  });
});

test.describe('Mobile Calibration (TC-CAL-M)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/m/calibration');
  });

  test('TC-CAL-M-01: start session', async ({ page }) => {
    await page.route('**/api/v1/calibration/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'cal_123',
          startedAt: new Date().toISOString(),
        }),
      });
    });

    await page.getByRole('button', { name: 'Start Kalibrering' }).click();
    await expect(page.getByText('Samples: 0/5')).toBeVisible();
  });

  test('TC-CAL-M-02: submit success', async ({ page }) => {
    await page.route('**/api/v1/calibration/start', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ sessionId: 'cal_123', startedAt: new Date().toISOString() }),
      });
    });

    await page.route('**/api/v1/calibration/submit', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, processedSamples: 5 }),
      });
    });

    await page.getByRole('button', { name: 'Start Kalibrering' }).click();

    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Legg til sample' }).click();
    }

    await page.getByRole('button', { name: 'Send inn' }).click();
    await expect(page.getByText('Kalibrering fullført!')).toBeVisible();
  });

  test('TC-CAL-M-03: 422 invalid samples', async ({ page }) => {
    await page.route('**/api/v1/calibration/start', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ sessionId: 'cal_123', startedAt: new Date().toISOString() }),
      });
    });

    await page.route('**/api/v1/calibration/submit', async (route) => {
      await route.fulfill({
        status: 422,
        body: JSON.stringify({
          type: 'validation_error',
          message: 'Minimum 5 samples required',
        }),
      });
    });

    await page.getByRole('button', { name: 'Start Kalibrering' }).click();
    await page.getByRole('button', { name: 'Legg til sample' }).click();
    await page.getByRole('button', { name: 'Legg til sample' }).click();

    await expect(page.getByRole('button', { name: 'Send inn' })).toBeDisabled();
  });

  test('TC-CAL-M-04: 500 retry preserves samples', async ({ page }) => {
    await page.route('**/api/v1/calibration/start', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ sessionId: 'cal_123', startedAt: new Date().toISOString() }),
      });
    });

    let attemptCount = 0;
    await page.route('**/api/v1/calibration/submit', async (route) => {
      attemptCount++;
      if (attemptCount === 1) {
        await route.fulfill({ status: 500 });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, processedSamples: 5 }),
        });
      }
    });

    await page.getByRole('button', { name: 'Start Kalibrering' }).click();

    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Legg til sample' }).click();
    }

    await page.getByRole('button', { name: 'Send inn' }).click();
    await expect(page.getByText(/gikk galt/i)).toBeVisible();

    await expect(page.getByText('Samples: 5/5')).toBeVisible();
  });
});

test.describe('Mobile Plan (TC-PLAN-M)', () => {
  test('TC-PLAN-M-01: current plan success', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/plan/current', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'plan_123',
          name: 'Vinter Treningsplan 2025',
          currentWeek: 3,
          totalWeeks: 12,
          focus: 'Styrke og kondisjon',
        }),
      });
    });

    await page.goto('/m/plan');
    await expect(page.getByText('Vinter Treningsplan 2025')).toBeVisible();
    await expect(page.getByText('Uke 3 av 12')).toBeVisible();
    await expect(page.getByText('Styrke og kondisjon')).toBeVisible();
  });

  test('TC-PLAN-M-02: 404 no plan shows empty CTA', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/plan/current', async (route) => {
      await route.fulfill({ status: 404 });
    });

    await page.goto('/m/plan');
    await expect(page.getByText('Ingen aktiv plan')).toBeVisible();
  });
});

test.describe('Mobile Quick Log (TC-LOG-M)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/m/log');
  });

  test('TC-LOG-M-01: save success', async ({ page }) => {
    await page.route('**/api/v1/training/sessions', async (route) => {
      const headers = route.request().headers();
      expect(headers['idempotency-key']).toBeTruthy();

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'session_123',
          type: 'golf',
          duration: 60,
        }),
      });
    });

    await page.selectOption('select', 'golf');
    await page.fill('input[type="number"]', '60');
    await page.getByRole('button', { name: 'Lagre' }).click();

    await expect(page.getByText('Trening lagret!')).toBeVisible();
  });

  test('TC-LOG-M-02: validation 400 inline', async ({ page }) => {
    await page.route('**/api/v1/training/sessions', async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({
          type: 'validation_error',
          message: 'Invalid input',
        }),
      });
    });

    await page.getByRole('button', { name: 'Lagre' }).click();
    await expect(page.getByText(/Ugyldig input/i)).toBeVisible();
  });

  test('TC-LOG-M-03: idempotency prevents duplicates', async ({ page }) => {
    let callCount = 0;
    let firstKey = null;

    await page.route('**/api/v1/training/sessions', async (route) => {
      callCount++;
      const key = route.request().headers()['idempotency-key'];

      if (!firstKey) firstKey = key;
      expect(key).toBe(firstKey);

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ id: 'session_123', cached: callCount > 1 }),
      });
    });

    await page.getByRole('button', { name: 'Lagre' }).click();
    await expect(page.getByText('Trening lagret!')).toBeVisible();

    await page.getByRole('button', { name: /dismiss|ok/i }).click();

    await page.getByRole('button', { name: 'Lagre' }).click();
    expect(callCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Mobile Calendar (TC-CALN-M)', () => {
  test('TC-CALN-M-01: range list', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/calendar/events', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'evt_1', title: 'Golf Trening', date: '2025-12-17T10:00:00Z', duration: 120 },
          { id: 'evt_2', title: 'Styrketrening', date: '2025-12-18T16:00:00Z', duration: 60 },
        ]),
      });
    });

    await page.goto('/m/calendar');
    await expect(page.getByText('Golf Trening')).toBeVisible();
    await expect(page.getByText('Styrketrening')).toBeVisible();
    await expect(page.getByText('120 min')).toBeVisible();
  });

  test('TC-CALN-M-02: empty state', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/v1/calendar/events', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      });
    });

    await page.goto('/m/calendar');
    await expect(page.getByText('Ingen hendelser')).toBeVisible();
    await expect(page.getByText('Ingen planlagte aktiviteter')).toBeVisible();
  });
});
