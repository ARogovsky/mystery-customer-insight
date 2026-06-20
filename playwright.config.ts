import type { ChromaticConfig } from '@chromatic-com/playwright';
import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Грузим локальные секреты (.env.local) в процесс Playwright, чтобы global.setup.ts
// (clerkSetup) и хелперы видели CLERK_SECRET_KEY / publishable key / COMING_SOON_BYPASS.
// next dev и так читает .env.local сам; здесь — для node-процесса тестов.
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

// Use process.env.PORT by default and fallback to port 3008
// to avoid conflicts with the Next.js default port 3000.
const PORT = process.env.PORT ?? '3008';

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<ChromaticConfig>({
  testDir: './tests',
  // Look for files with the .integ.js or .e2e.js extension
  testMatch: '*.@(integ|e2e).?(c|m)[jt]s?(x)',
  // Timeout per test. В dev-режиме (локально) Next компилирует роуты по первому
  // запросу — это медленно, поэтому таймаут щедрый. В CI используется собранный
  // `start`, там быстрее.
  timeout: (process.env.CI ? 30 : 120) * 1000,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // e2e делят один dev-сервер и одну in-memory БД PGLite + общий набор тестовых
  // юзеров Clerk, поэтому гоняем последовательно (1 воркер), чтобы не было гонок.
  workers: 1,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: process.env.CI ? 'github' : 'list',

  expect: {
    // Set timeout for async expect matchers
    timeout: (process.env.CI ? 15 : 30) * 1000,
  },

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: process.env.CI
      ? 'pglite-server -m 100 --include-database-url --run \'run-s db:migrate start\''
      : 'pglite-server -m 100 -p 5433 --include-database-url --run \'run-s db:migrate:e2e dev:next\'',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 2 * 1000 },
    env: {
      BROWSER_TO_TERMINAL_DISABLED: 'true',
      NEXT_PUBLIC_SENTRY_DISABLED: 'true',
      NEXT_PUBLIC_APP_URL: baseURL,
      PORT,
      // Coming Soon обходим preview-cookie (см. tests/helpers.ts). Прокидываем токен
      // и Clerk-ключи явно, чтобы dev-сервер тестов точно их видел. DATABASE_URL НЕ
      // трогаем — его задаёт pglite-server для изолированной БД тестов.
      COMING_SOON_BYPASS: process.env.COMING_SOON_BYPASS ?? 'dev-preview-7x9',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? '',
    },
  },

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: process.env.CI ? 'on' : 'retain-on-failure',

    // Record videos when retrying the failed test.
    video: process.env.CI ? 'retain-on-failure' : undefined,

    // Disable automatic screenshots at test completion when using Chromatic test fixture.
    disableAutoSnapshot: true,
  },

  projects: [
    // `setup` and `teardown` are used to run code before and after all E2E tests.
    // These functions can be used to configure Clerk for testing purposes. For example, bypassing bot detection.
    // In the `setup` file, you can create an account in `Test mode`.
    // For each test, an organization can be created within this account to ensure total isolation.
    // After all tests are completed, the `teardown` file can delete the account and all associated organizations.
    // You can find the `setup` and `teardown` files at: https://nextjs-boilerplate.com/pro-saas-starter-kit
    // Or, need a Self-hosted auth stack (Better Auth)? Try Next.js Boilerplate Max: https://nextjs-boilerplate.com/nextjs-multi-tenant-saas-boilerplate
    { name: 'setup', testMatch: /.*\.setup\.ts/, teardown: 'teardown' },
    { name: 'teardown', testMatch: /.*\.teardown\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup'],
          },
        ]
      : []),
  ],
});
