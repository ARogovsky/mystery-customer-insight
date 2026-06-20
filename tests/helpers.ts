import type { BrowserContext, Page } from '@playwright/test';
import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';

const PORT = process.env.PORT ?? '3008';
const BASE_URL = `http://localhost:${PORT}`;
const BYPASS_TOKEN = process.env.COMING_SOON_BYPASS ?? 'dev-preview-7x9';

/** Тестовые юзеры Clerk (dev-инстанс). Вход — по email-коду 424242 (+clerk_test). */
export const USERS = {
  developer: {
    email: 'mci+clerk_test@example.com',
    role: 'developer' as const,
  },
  tester: {
    email: 'mci-tester+clerk_test@example.com',
    role: 'tester' as const,
  },
};

/** Ставит cookie обхода заглушки Coming Soon на весь контекст. */
export async function bypassComingSoon(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'preview',
      value: BYPASS_TOKEN,
      url: BASE_URL,
    },
  ]);
}

/**
 * Вход через Clerk с Testing Token. Инстанс использует email-код как первый фактор,
 * поэтому стратегия email_code (для +clerk_test код фиксирован: 424242).
 */
async function signIn(page: Page, email: string) {
  await setupClerkTestingToken({ page });

  // ClerkProvider смонтирован только в группе (auth). На маркетинговых страницах
  // ClerkJS не грузится, поэтому открываем публичный /sign-in (там есть провайдер).
  await page.goto('/sign-in');

  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: email },
  });
}

/** Выход из Clerk-сессии. Гарантируем, что ClerkJS загружен (через (auth)-страницу). */
export async function signOut(page: Page) {
  // /dashboard — в группе (auth), там смонтирован ClerkProvider. Если сессия есть,
  // страница откроется и window.Clerk будет доступен для signOut.
  await page.goto('/dashboard');
  await clerk.signOut({ page });
}

/**
 * Полный вход + онбординг роли. В e2e БД (PGLite) профилей нет, поэтому первый вход
 * любого юзера показывает экран выбора роли на /dashboard — выбираем нужную роль.
 * Идемпотентно: если профиль уже создан в этом прогоне, экран не появится.
 */
export async function signInAndOnboard(
  context: BrowserContext,
  page: Page,
  user: { email: string; role: 'developer' | 'tester' },
) {
  await bypassComingSoon(context);
  await signIn(page, user.email);

  await page.goto('/dashboard');

  const roleHeading = page.getByRole('heading', { name: 'Choose your role' });
  const workHeading = user.role === 'developer'
    ? page.getByRole('heading', { name: /Your apps|Submit your first app/ })
    : page.getByRole('heading', { name: 'My reports' });

  // Дождаться, пока /dashboard прогрузится: либо выбор роли, либо рабочий вид.
  await roleHeading.or(workHeading).first().waitFor();

  if (await roleHeading.isVisible()) {
    const label = user.role === 'developer' ? 'I am a developer' : 'I am a tester';
    await page.getByRole('button', { name: label }).click();
    // Дождаться рабочего вида дашборда после серверного действия (revalidate).
    await workHeading.waitFor();
  }
}

/**
 * Создаёт приложение+кампанию от лица уже залогиненного и онбординг-нутого разработчика.
 * Идёт напрямую на /dashboard/apps/new (там форма доступна разработчику всегда).
 */
export async function createCampaign(page: Page, title: string) {
  await page.goto('/dashboard/apps/new');
  await page.locator('input[name="appName"]').fill(`App for ${title}`);
  await page.locator('input[name="appUrl"]').fill('https://example.com/app');
  await page.locator('textarea[name="description"]').fill('Short description');
  await page.locator('input[name="platforms"][value="web"]').check();
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="scenario"]').fill('Open the app and try the main flow.');
  await page.locator('input[name="q_prompt_0"]').fill('Did it work?');
  await page.locator('select[name="q_type_0"]').selectOption('text');

  await page.getByRole('button', { name: 'Submit app' }).click();
  await page.waitForURL('**/dashboard');
}
