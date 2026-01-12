import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */

// Use static serve (port 9000) in CI, dev server (port 8000) locally
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000'
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: isCI ? 1 : undefined,
  /* Reporter to use */
  reporter: isCI ? 'github' : 'html',
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Run server before starting the tests */
  webServer: {
    // Use gatsby serve (static) in CI, gatsby develop (HMR) locally
    command: isCI ? 'npm run serve' : 'npm run develop',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
})
