import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { bypassComingSoon, signOut, signUpAndOnboard } from '../helpers';

// SEED (против Docker-БД, данные ОСТАЮТСЯ): расширенный кейс для ручной проверки.
// Свежий разработчик (с display name) публикует 3 приложения (ios/android/web) с
// вопросами разных типов; 3 тестера шлют отчёты на одно приложение (multi-tester);
// разработчик плюсует +1 ДВУМ разным тестерам (третьего оставляет без плюса); аноним
// оставляет отзывы и репортит один отзыв 3 раза (автоскрытие). В конце печатаются доступы.

type SeededApp = { title: string; platform: string; href: string };

async function createSeedCampaign(page: Page, title: string, platform: string) {
  await page.goto('/dashboard/apps/new');
  await page.locator('input[name="appName"]').fill(`App: ${title}`);
  await page.locator('input[name="appUrl"]').fill('https://example.com/app');
  await page.locator('textarea[name="description"]').fill(`Seeded ${platform} app.`);
  await page.locator(`input[name="platforms"][value="${platform}"]`).check();
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="scenario"]').fill('Install the app and complete the main flow.');
  await page.locator('select[name="status"]').selectOption('open');

  await page.locator('input[name="q_prompt_0"]').fill('What worked well?');
  await page.locator('select[name="q_type_0"]').selectOption('text');
  await page.locator('input[name="q_prompt_1"]').fill('Rate the UX');
  await page.locator('select[name="q_type_1"]').selectOption('rating');
  await page.locator('input[name="q_prompt_2"]').fill('Would you recommend it?');
  await page.locator('select[name="q_type_2"]').selectOption('boolean');
  await page.locator('input[name="q_prompt_3"]').fill('Best feature?');
  await page.locator('select[name="q_type_3"]').selectOption('choice');
  await page.locator('input[name="q_options_3"]').fill('Speed, Design, Reliability');

  await page.getByRole('button', { name: 'Submit app' }).click();
  await page.waitForURL('**/dashboard');
}

async function submitReport(page: Page, app: SeededApp, comment: string) {
  await page.goto(app.href);
  await page.getByRole('link', { name: 'Submit a report' }).click();
  await page.waitForURL('**/dashboard/reports/new/**');

  const fieldset = page.locator('fieldset').filter({ has: page.getByText('Questions', { exact: true }) });
  const textAnswers = fieldset.locator('textarea');
  for (let i = 0; i < (await textAnswers.count()); i++) {
    await textAnswers.nth(i).fill('Worked as expected.');
  }
  const selects = fieldset.locator('select');
  for (let i = 0; i < (await selects.count()); i++) {
    await selects.nth(i).selectOption({ index: 1 });
  }

  await page.locator('textarea[name="freeText"]').fill(comment);
  await page.locator('input[name="linkUrl"]').fill('https://example.com/screenshot.png');
  await page.getByRole('button', { name: 'Submit report' }).click();
  await page.waitForURL('**/dashboard');
}

test('seed extended case into Docker DB', async ({ context, page }) => {
  test.setTimeout(180_000);

  const stamp = Date.now();
  const devEmail = `mci-seed-dev-${stamp}+clerk_test@example.com`;
  const devName = `SEED Developer ${stamp}`;
  // Тестеры: существующий + два фиксированных (создаются один раз через sign-up).
  const testers = [
    'mci-tester+clerk_test@example.com',
    'mci-tester2+clerk_test@example.com',
    'mci-tester3+clerk_test@example.com',
  ];
  const plan = [
    { title: `SEED iOS ${stamp}`, platform: 'ios' },
    { title: `SEED Android ${stamp}`, platform: 'android' },
    { title: `SEED Web ${stamp}`, platform: 'web' },
  ];

  // 1) Свежий разработчик (с именем) публикует 3 приложения под разные платформы.
  await signUpAndOnboard(context, page, { email: devEmail, role: 'developer' }, devName);
  for (const p of plan) {
    await createSeedCampaign(page, p.title, p.platform);
  }

  // Собираем публичные ссылки.
  const apps: SeededApp[] = [];
  await page.goto('/apps');
  for (const p of plan) {
    const href = await page.getByRole('link', { name: new RegExp(p.title) }).getAttribute('href');
    apps.push({ ...p, href: href ?? '' });
  }

  // Проверка: фильтр по платформе реально фильтрует.
  await page.goto('/apps?platform=android');

  await expect(page.getByRole('link', { name: new RegExp(plan[1]!.title) })).toBeVisible();
  await expect(page.getByRole('link', { name: new RegExp(plan[0]!.title) })).toHaveCount(0);

  await signOut(page);

  // 2) Три тестера шлют отчёты на ПЕРВОЕ приложение (multi-tester); первый ещё и на второе.
  for (let i = 0; i < testers.length; i++) {
    await signUpAndOnboard(context, page, { email: testers[i]!, role: 'tester' });
    await submitReport(page, apps[0]!, `Report on iOS from tester ${i + 1}`);
    if (i === 0) {
      await submitReport(page, apps[1]!, 'Report on Android from tester 1');
    }
    await signOut(page);
  }

  // 3) Разработчик плюсует +1 ДВУМ разным тестерам на первом приложении (третий — без плюса).
  await signUpAndOnboard(context, page, { email: devEmail, role: 'developer' }, devName);
  await page.goto('/dashboard');
  await page.getByRole('link', { name: apps[0]!.title }).click();
  await page.waitForURL('**/dashboard/apps/**/submissions');
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: '+1 to tester' }).first().click();

    await expect(page.getByText('Rated +1')).toHaveCount(i + 1);
  }

  await signOut(page);

  // 4) Аноним: 3 отзыва на третье приложение, затем репорт первого отзыва 3 раза (скрытие).
  await bypassComingSoon(context);
  const reviewApp = apps[2]!;
  for (let i = 1; i <= 3; i++) {
    await page.goto(reviewApp.href);
    await page.locator('textarea[name="body"]').fill(`Anonymous review #${i} (${stamp})`);
    await page.locator('select[name="rating"]').selectOption(String(i + 2));
    await page.getByRole('button', { name: 'Post review' }).click();

    await expect(page.getByText(`Anonymous review #${i} (${stamp})`)).toBeVisible();
  }
  for (let i = 0; i < 3; i++) {
    await page.goto(reviewApp.href);
    const reviewItem = page.locator('li').filter({ hasText: `Anonymous review #1 (${stamp})` });
    const details = reviewItem.locator('details');
    await details.locator('summary').click();
    await details.locator('select[name="reason"]').selectOption('spam');
    await details.locator('textarea[name="details"]').fill(`Seed report ${i + 1}`);
    await details.getByRole('button', { name: 'Send report' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  const base = new URL(page.url()).origin;
  const bypass = process.env.COMING_SOON_BYPASS ?? 'dev-preview-7x9';
  // eslint-disable-next-line no-console
  console.log(`
================ SEED ГОТОВ — данные в Docker-БД (mci) ================
Открой сайт с обходом заглушки (один раз, ставит cookie):
  ${base}/?preview=${bypass}

Вход (Clerk): на /sign-in ввести email, затем код 424242 (пароль не нужен).
  • Разработчик: ${devEmail}   (display name: "${devName}")
  • Тестер 1:    ${testers[0]}
  • Тестер 2:    ${testers[1]}
  • Тестер 3:    ${testers[2]}

Созданные приложения:
  • [ios]     ${plan[0]!.title}  -> ${base}${apps[0]!.href}
  • [android] ${plan[1]!.title}  -> ${base}${apps[1]!.href}
  • [web]     ${plan[2]!.title}  -> ${base}${apps[2]!.href}

Что проверить руками:
  • На iOS-приложении 3 отчёта от 3 тестеров; +1 стоит у двух, у третьего — кнопка «+1».
  • У тестеров 1 и 2 рейтинг +1; у каждого tests completed >= 1 (в их дашбордах).
  • На web-приложении 3 отзыва, но отзыв #1 скрыт после 3 репортов (видны #2 и #3).
  • Фильтр /apps?platform=android показывает только android-приложение.
  • На странице приложения видно автора: "by ${devName}".
=====================================================================
`);
});
