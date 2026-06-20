import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// SEED-режим: гоняет сценарий против Docker-БД (как обычный dev:next), данные ОСТАЮТСЯ,
// в конце печатаются доступы тест-юзеров для ручной проверки. НЕ для CI.
// Запуск: `npm run test:seed`. Изолированный e2e — отдельно (playwright.config.ts).
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const PORT = process.env.SEED_PORT ?? '3001';
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.seed.ts',
  timeout: 180 * 1000,
  workers: 1,
  reporter: 'list',
  expect: { timeout: 30 * 1000 },

  // Сервер на Docker-БД (.env.local: DATABASE_URL -> localhost:5434/mci).
  // Если твой dev-сервер уже поднят на этом порту — переиспользуем его.
  webServer: {
    command: 'npm run dev:next',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_SENTRY_DISABLED: 'true',
      NEXT_PUBLIC_APP_URL: baseURL,
      PORT,
      COMING_SOON_BYPASS: process.env.COMING_SOON_BYPASS ?? 'dev-preview-7x9',
    },
  },

  use: {
    baseURL,
    trace: 'retain-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
