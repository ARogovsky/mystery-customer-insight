import { expect, test } from '@playwright/test';

// Checkly-проверка задеплоенного окружения (расширение `.check.e2e.ts`).
// Заглушка Coming Soon снята (COMING_SOON=false) — прод отдаёт реальный лендинг,
// его и проверяем как признак «сайт жив».
test.describe('Sanity', () => {
  test('landing is served', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Real-device testing by real people' }),
    ).toBeVisible();
  });
});
