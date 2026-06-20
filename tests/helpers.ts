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
  dev2: {
    email: 'mci-dev2+clerk_test@example.com',
    role: 'developer' as const,
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

// Минимальная типизация window.Clerk для evaluate (без any).
type SignUpResource = {
  create: (params: { emailAddress: string; password?: string }) => Promise<unknown>;
  prepareEmailAddressVerification: (params: { strategy: string }) => Promise<unknown>;
  attemptEmailAddressVerification: (
    params: { code: string },
  ) => Promise<{ status: string | null; createdSessionId: string | null | undefined; missingFields?: string[] }>;
};
type TestClerk = {
  client: { signUp: SignUpResource };
  setActive: (params: { session: string | null | undefined }) => Promise<void>;
};

// Пароль для регистрируемых тест-юзеров (инстанс требует пароль при sign-up).
const SIGNUP_PASSWORD = 'SeedPass!2026xY';

/**
 * Регистрация нового тест-юзера. Любой +clerk_test email создаётся на лету
 * (реальная почта не нужна, код подтверждения фиксированный — 424242).
 */
async function signUp(page: Page, email: string) {
  await setupClerkTestingToken({ page });
  await page.goto('/sign-up');
  await page.waitForFunction(() => (window as unknown as { Clerk?: { loaded?: boolean } }).Clerk?.loaded);

  await page.evaluate(async ({ emailAddress, password }) => {
    const clerkObj = (window as unknown as { Clerk: TestClerk }).Clerk;
    const su = clerkObj.client.signUp;
    await su.create({ emailAddress, password });
    await su.prepareEmailAddressVerification({ strategy: 'email_code' });
    const res = await su.attemptEmailAddressVerification({ code: '424242' });

    if (res.status === 'complete') {
      await clerkObj.setActive({ session: res.createdSessionId });
    } else {
      throw new Error(
        `Clerk sign-up status: ${res.status}; missing: ${(res.missingFields ?? []).join(',')}`,
      );
    }
  }, { emailAddress: email, password: SIGNUP_PASSWORD });
}

/** Вход, а если юзера ещё нет — регистрация (идемпотентно между прогонами). */
async function signInOrSignUp(page: Page, email: string) {
  try {
    await signIn(page, email);
  } catch {
    await signUp(page, email);
  }
}

/** Онбординг роли на /dashboard (+ опц. display name). Идемпотентно. */
async function onboardRole(
  page: Page,
  role: 'developer' | 'tester',
  displayName?: string,
) {
  await page.goto('/dashboard');

  const roleHeading = page.getByRole('heading', { name: 'Choose your role' });
  const workHeading = role === 'developer'
    ? page.getByRole('heading', { name: /Your apps|Submit your first app/ })
    : page.getByRole('heading', { name: 'My reports' });

  await roleHeading.or(workHeading).first().waitFor();

  if (await roleHeading.isVisible()) {
    if (displayName) {
      await page.locator('input[name="displayName"]').fill(displayName);
    }
    const label = role === 'developer' ? 'I am a developer' : 'I am a tester';
    await page.getByRole('button', { name: label }).click();
    await workHeading.waitFor();
  }
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
  displayName?: string,
) {
  await bypassComingSoon(context);
  await signIn(page, user.email);
  await onboardRole(page, user.role, displayName);
}

/** Регистрация нового юзера + онбординг роли (для свежих +clerk_test адресов). */
export async function signUpAndOnboard(
  context: BrowserContext,
  page: Page,
  user: { email: string; role: 'developer' | 'tester' },
  displayName?: string,
) {
  await bypassComingSoon(context);
  await signInOrSignUp(page, user.email);
  await onboardRole(page, user.role, displayName);
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
