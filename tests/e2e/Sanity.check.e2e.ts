import { expect, test } from '@playwright/test';

// Checkly-проверка задеплоенного окружения (расширение `.check.e2e.ts`).
// Прод сейчас под заглушкой Coming Soon (флаг COMING_SOON в AppConfig), поэтому
// без preview-cookie любой роут отдаёт страницу-заглушку — её и проверяем как
// признак «сайт жив». Когда снимем заглушку — заменим на проверку реального лендинга.
test.describe('Sanity', () => {
  test('coming soon page is served', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Mystery Customer Insight' })).toBeVisible();
    await expect(page.getByText('Coming soon.')).toBeVisible();
  });
});
