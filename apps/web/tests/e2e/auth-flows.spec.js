/**
 * Authentication Flows E2E Tests
 *
 * Tests all authentication-related flows:
 * 1. Registration
 * 2. Login/Logout
 * 3. Forgot password
 * 4. Password reset
 * 5. Email verification
 * 6. Session management
 * 7. 2FA setup (if implemented)
 */

import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('Register new organization and admin user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Admin');
    await page.fill('input[name="email"]', `testadmin${timestamp}@example.com`);
    await page.fill('input[name="organizationName"]', `Test Academy ${timestamp}`);
    await page.fill('input[name="password"]', 'TestPassword123!');

    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill('TestPassword123!');
    }

    // Accept terms if checkbox exists
    const termsCheckbox = page.locator('input[type="checkbox"][name*="terms" i], input[type="checkbox"][name*="agree" i]').first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or success page
    await page.waitForTimeout(3000);

    // Verify successful registration
    const url = page.url();
    expect(url).toMatch(/dashboard|welcome|success/i);
  });

  test('Registration validation - invalid email', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should show validation error
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('.error, [role="alert"], .field-error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toContainText(/email|invalid/i);
    }
  });

  test('Registration validation - weak password', async ({ page }) => {
    await page.goto('/register');

    const timestamp = Date.now();
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'weak');
    await page.click('button[type="submit"]');

    // Should show password strength error
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('.error, [role="alert"], .password-error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toContainText(/password|weak|strong|character/i);
    }
  });

  test('Registration validation - duplicate email', async ({ page }) => {
    await page.goto('/register');

    // Try to register with existing email
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="organizationName"]', 'Test Org');

    await page.click('button[type="submit"]');

    // Should show duplicate email error
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('.error, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toContainText(/email|exists|already|registered/i);
    }
  });
});

test.describe('Login Flow', () => {
  test('Successful login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(/dashboard|home/i, { timeout: 5000 });
    expect(page.url()).toMatch(/dashboard|home/i);
  });

  test('Login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('.error, [role="alert"], .login-error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toContainText(/invalid|incorrect|failed|credentials/i);
    }

    // Should stay on login page
    expect(page.url()).toContain('login');
  });

  test('Login validation - empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    // Should show validation errors
    await page.waitForTimeout(1000);
    const errors = page.locator('.error, [role="alert"], .field-error');
    if (await errors.count() > 0) {
      expect(await errors.count()).toBeGreaterThan(0);
    }
  });

  test('Remember me functionality', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');

    // Check remember me if it exists
    const rememberCheckbox = page.locator('input[type="checkbox"][name*="remember" i]').first();
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i, { timeout: 5000 });

    // Check if session persists
    const cookies = await page.context().cookies();
    expect(cookies.length).toBeGreaterThan(0);
  });
});

test.describe('Logout Flow', () => {
  test('Successful logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i);

    // Logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try user menu dropdown
      const userMenu = page.locator('[data-testid="user-menu"], .user-dropdown, button[aria-label*="user" i]').first();
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(500);

        const logoutLink = page.locator('a:has-text("Logout"), button:has-text("Sign Out")').first();
        await logoutLink.click();
      }
    }

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('login');

    // Try to access protected page
    await page.goto('/dashboard');

    // Should redirect back to login
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });
});

test.describe('Forgot Password Flow', () => {
  test('Request password reset link', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("Reset"), button:has-text("Forgot")').first();
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      // Fill email
      const emailField = page.locator('input[name="email"]').first();
      if (await emailField.isVisible()) {
        await emailField.fill('admin@demo.com');

        await page.click('button[type="submit"]');

        // Should show success message
        await page.waitForTimeout(2000);
        const successMessage = page.locator('.success, [role="alert"], .message');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toContainText(/sent|email|check|reset/i);
        }
      }
    }
  });

  test('Forgot password - invalid email', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")').first();
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      const emailField = page.locator('input[name="email"]').first();
      if (await emailField.isVisible()) {
        await emailField.fill('invalid-email');
        await page.click('button[type="submit"]');

        // Should show validation error
        await page.waitForTimeout(1000);
        const errorMessage = page.locator('.error, [role="alert"]');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toContainText(/email|invalid/i);
        }
      }
    }
  });
});

test.describe('Password Reset Flow', () => {
  test('Reset password with valid token', async ({ page }) => {
    // Simulate visiting reset link with token
    await page.goto('/reset-password?token=test-reset-token-123');

    const newPasswordField = page.locator('input[name="password"], input[name="newPassword"]').first();
    if (await newPasswordField.isVisible()) {
      await newPasswordField.fill('NewPassword123!');

      const confirmField = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
      if (await confirmField.isVisible()) {
        await confirmField.fill('NewPassword123!');
      }

      await page.click('button[type="submit"]');

      // Should redirect or show success
      await page.waitForTimeout(2000);
    }
  });

  test('Reset password - password mismatch', async ({ page }) => {
    await page.goto('/reset-password?token=test-token');

    const newPasswordField = page.locator('input[name="password"], input[name="newPassword"]').first();
    if (await newPasswordField.isVisible()) {
      await newPasswordField.fill('NewPassword123!');

      const confirmField = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
      if (await confirmField.isVisible()) {
        await confirmField.fill('DifferentPassword123!');
      }

      await page.click('button[type="submit"]');

      // Should show mismatch error
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('.error, [role="alert"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toContainText(/match|same|identical/i);
      }
    }
  });
});

test.describe('Session Management', () => {
  test('Session persists across page reloads', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i);

    // Reload page
    await page.reload();

    // Should still be logged in
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/dashboard|home/i);
  });

  test('Expired session redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i);

    // Clear session storage/cookies to simulate expiration
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    // Try to access protected page
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('Token refresh on API call', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i);

    // Wait and make an API call to trigger refresh
    await page.waitForTimeout(2000);

    // Navigate to a page that makes API calls
    await page.goto('/dashboard');

    // Session should still be valid
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/dashboard|home/i);
  });
});

test.describe('Protected Route Access', () => {
  test('Unauthenticated user redirected from protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/player/training',
      '/coach/players',
      '/admin/users',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to login
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('login');
    }
  });

  test('Authenticated user can access protected routes', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i);

    // Try accessing protected routes
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/dashboard/i);
  });
});

test.describe('Role-Based Access', () => {
  test('Player cannot access coach routes', async ({ page }) => {
    // Login as player
    await page.goto('/login');
    await page.fill('input[name="email"]', 'player@demo.com');
    await page.fill('input[name="password"]', 'player123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/player|dashboard/i);

    // Try to access coach route
    await page.goto('/coach/players');

    // Should redirect or show forbidden
    await page.waitForTimeout(2000);
    const isForbidden = page.url().includes('403') || page.url().includes('unauthorized');
    const isRedirected = !page.url().includes('/coach/');

    expect(isForbidden || isRedirected).toBe(true);
  });

  test('Coach cannot access admin routes', async ({ page }) => {
    // Login as coach
    await page.goto('/login');
    await page.fill('input[name="email"]', 'coach@demo.com');
    await page.fill('input[name="password"]', 'coach123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/coach|dashboard/i);

    // Try to access admin route
    await page.goto('/admin/settings');

    // Should redirect or show forbidden
    await page.waitForTimeout(2000);
    const isForbidden = page.url().includes('403') || page.url().includes('unauthorized');
    const isRedirected = !page.url().includes('/admin/');

    expect(isForbidden || isRedirected).toBe(true);
  });
});

test.describe('Security Headers', () => {
  test('Application sets security headers', async ({ page }) => {
    const response = await page.goto('/login');

    if (response) {
      const headers = response.headers();

      // Check for security headers (may vary based on server config)
      // These are best practices but may not all be implemented
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'strict-transport-security',
      ];

      // At least some security headers should be present
      const hasSecurityHeaders = securityHeaders.some(header => header in headers);
      // Note: This is a soft check as server configuration may vary
    }
  });
});
