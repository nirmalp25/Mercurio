import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite for the Mercurio catalogue. It drives the real stack (Vite frontend -> Laravel API -> Postgres),
 * so start it first with `docker compose up -d` from the repo root.
 *
 *   E2E_BASE_URL  frontend origin (default http://localhost:5173)
 *   E2E_API_URL   API origin, used only for cross-checking data (default http://localhost:8088)
 */
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  // Specs share one backend (and the enquiry endpoint is throttled per IP), so keep runs serial.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
