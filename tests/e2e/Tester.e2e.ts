import { expect, test } from '@playwright/test';
import { createCampaign, signInAndOnboard, signOut, USERS } from '../helpers';

// Полный соц-цикл: разработчик создаёт кампанию → тестер шлёт отчёт → анонимный отзыв
// → разработчик ставит +1. Один тест = единое состояние сессии (несколько входов/выходов).
test.describe('Tester & social flow', () => {
  test('report, review and rating end-to-end', async ({ context, page }) => {
    test.setTimeout(120_000);

    const title = `Social campaign ${Date.now()}`;

    // 1. Разработчик создаёт кампанию.
    await signInAndOnboard(context, page, USERS.developer);
    await createCampaign(page, title);

    // Берём публичную ссылку на кампанию из ленты.
    await page.goto('/apps');
    const card = page.getByRole('link', { name: new RegExp(title) });

    await expect(card).toBeVisible();

    await card.click();
    await page.waitForURL('**/apps/**');
    const appUrl = page.url();

    await signOut(page);

    // 2. Тестер шлёт отчёт.
    await signInAndOnboard(context, page, USERS.tester);
    await page.goto(appUrl);
    await page.getByRole('link', { name: 'Submit a report' }).click();
    await page.waitForURL('**/dashboard/reports/new/**');

    await expect(page.getByRole('heading', { name: 'Submit a report' })).toBeVisible();

    const reportText = `Worked great ${Date.now()}`;
    await page.locator('textarea[name="freeText"]').fill(reportText);
    await page.locator('input[name="linkUrl"]').fill('https://example.com/screenshot.png');
    await page.getByRole('button', { name: 'Submit report' }).click();
    await page.waitForURL('**/dashboard');

    // Отчёт виден в дашборде тестера.
    await expect(page.getByRole('heading', { name: 'My reports' })).toBeVisible();
    await expect(page.getByRole('link', { name: title })).toBeVisible();

    // Отчёт виден на публичной странице результатов (тестер обезличен).
    await page.goto(`${appUrl}/results`);

    await expect(page.getByRole('heading', { name: new RegExp(`Results —\\s*${title}`) })).toBeVisible();
    await expect(page.getByText(reportText)).toBeVisible();

    // 3. Анонимный отзыв на странице приложения.
    await page.goto(appUrl);
    const reviewBody = `Solid experience ${Date.now()}`;
    await page.locator('textarea[name="body"]').fill(reviewBody);
    await page.locator('select[name="rating"]').selectOption('5');
    await page.getByRole('button', { name: 'Post review' }).click();

    await expect(page.getByText(reviewBody)).toBeVisible();

    await signOut(page);

    // 4. Разработчик ставит +1 за отчёт.
    await signInAndOnboard(context, page, USERS.developer);
    await page.goto('/dashboard');
    await page.getByRole('link', { name: title }).click();
    await page.waitForURL('**/dashboard/apps/**/submissions');

    await expect(page.getByText(reportText)).toBeVisible();

    await page.getByRole('button', { name: '+1 to tester' }).click();

    await expect(page.getByText('Rated +1')).toBeVisible();
  });
});
