import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

// Глобальная настройка Clerk для тестов: получает Testing Token, который глушит
// bot-protection FAPI. Требует CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// (грузятся из .env.local в playwright.config.ts). Запускается один раз перед всеми
// e2e-тестами (project `setup`, от которого зависит chromium).
setup('global clerk setup', async () => {
  await clerkSetup();
});
