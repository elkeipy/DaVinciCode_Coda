import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev -w server',
      url: 'http://localhost:3001/health',
      cwd: '..',
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -w client',
      url: 'http://localhost:5173',
      cwd: '..',
      reuseExistingServer: true,
    },
  ],
});
