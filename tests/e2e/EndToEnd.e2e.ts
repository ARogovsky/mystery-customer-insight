import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { createCampaign, signInAndOnboard, signOut, USERS } from '../helpers';

// Полный кейс: публикация → тестер ОДНИМ КЛИКОМ из листинга шлёт отчёт → разработчик
// ставит +1 и переводит кампанию в closed → она уходит из ленты, но у тестера отчёт
// остаётся с меткой «+1 received», а общий ранк вырос.
test.describe('End-to-end: report, +1, close, tester keeps it with rank', () => {
  test('full flow', async ({ context, page }) => {
    test.setTimeout(150_000);

    // 1) Разработчик публикует приложение (open).
    await signInAndOnboard(context, page, USERS.developer);
    const title = `E2E campaign ${Date.now()}`;
    await createCampaign(page, title);

    await signOut(page);

    // 2) Тестер: из листинга /apps ОДНИМ кликом «Submit a report».
    await signInAndOnboard(context, page, USERS.tester);
    const ratingBefore = await readRating(page);

    await page.goto('/apps');
    const card = page.locator('li').filter({ has: page.getByRole('link', { name: new RegExp(title) }) });
    await card.getByRole('link', { name: 'Submit a report' }).click();
    await page.waitForURL('**/dashboard/reports/new/**');

    await page.locator('textarea[name="freeText"]').fill('E2E report body');
    await page.getByRole('button', { name: 'Submit report' }).click();
    await page.waitForURL('**/dashboard');

    // Пока не оценён — метки «+1 received» у отчёта нет.
    const reportItem = page.locator('li').filter({ has: page.getByRole('link', { name: title }) });

    await expect(reportItem).toBeVisible();
    await expect(reportItem.getByText('+1 received')).toHaveCount(0);

    await signOut(page);

    // 3) Разработчик: +1 за отчёт, затем статус closed.
    await signInAndOnboard(context, page, USERS.developer);
    await page.goto('/dashboard');
    await page.getByRole('link', { name: title }).click();
    await page.waitForURL('**/dashboard/apps/**/submissions');
    await page.getByRole('button', { name: '+1 to tester' }).click();

    await expect(page.getByText('Rated +1')).toBeVisible();

    await setStatus(page, title, 'closed');

    // Кампания ушла из публичной ленты.
    await page.goto('/apps');

    await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveCount(0);

    await signOut(page);

    // 4) Тестер: отчёт остался, теперь с меткой «+1 received»; общий ранк вырос.
    await signInAndOnboard(context, page, USERS.tester);
    await page.goto('/dashboard');
    const keptItem = page.locator('li').filter({ has: page.getByRole('link', { name: title }) });

    await expect(keptItem).toBeVisible();
    await expect(keptItem.getByText('+1 received')).toBeVisible();

    const ratingAfter = await readRating(page);

    expect(ratingAfter).toBe(ratingBefore + 1);
  });
});

async function readRating(page: Page): Promise<number> {
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'My reports' })).toBeVisible();

  const text = (await page.getByText(/Rating:/).first().textContent()) ?? '';
  const match = text.match(/Rating:\s*(\d+)/);

  return match ? Number(match[1]) : 0;
}

async function setStatus(page: Page, title: string, status: string) {
  await page.goto('/dashboard');
  const form = page.locator('form').filter({ has: page.getByLabel(`Status for ${title}`) });
  await form.getByLabel(`Status for ${title}`).selectOption(status);
  await Promise.all([
    page.waitForResponse(r => r.request().method() === 'POST' && r.status() < 400),
    form.getByRole('button', { name: 'Update status' }).click(),
  ]);
}
