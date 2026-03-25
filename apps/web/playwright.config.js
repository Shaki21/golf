import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // In CI: serve pre-built static files (fast startup)
    // Locally: use dev server for hot reload (set reuseExistingServer)
    command: isCI ? 'npx serve -s build -l 3001' : 'npm start',
    url: 'http://localhost:3001',
    reuseExistingServer: !isCI,
    // serve starts in <5s, dev server needs more time
    timeout: isCI ? 30 * 1000 : 180 * 1000,
  },
});
