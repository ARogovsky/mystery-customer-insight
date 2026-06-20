import { expect, test } from '@playwright/test';
import { signInAndOnboard, USERS } from '../helpers';

// Пункт [2] бэклога: статусы draft/open/closed. draft/closed не в публичной ленте,
// open — в ленте. Смена статуса владельцем работает.
test.describe('Campaign status', () => {
  test('draft is hidden from feed, open shows, closed hides again', async ({ context, page }) => {
    test.setTimeout(120_000);

    await signInAndOnboard(context, page, USERS.developer);

    const title = `Status campaign ${Date.now()}`;
    await page.goto('/dashboard/apps/new');
    await page.locator('input[name="appName"]').fill(`App for ${title}`);
    await page.locator('input[name="appUrl"]').fill('https://example.com/app');
    await page.locator('input[name="platforms"][value="web"]').check();
    await page.locator('input[name="title"]').fill(title);
    await page.locator('textarea[name="scenario"]').fill('Scenario.');
    await page.locator('select[name="status"]').selectOption('draft');
    await page.getByRole('button', { name: 'Submit app' }).click();
    await page.waitForURL('**/dashboard');

    // draft виден разработчику в списке.
    const item = page.locator('li').filter({ has: page.getByRole('link', { name: title }) });

    await expect(item).toBeVisible();

    // draft НЕ в публичной ленте.
    await page.goto('/apps');

    await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveCount(0);

    // Переводим в open → появляется в ленте.
    await setStatus(page, title, 'open');
    await page.goto('/apps');

    await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();

    // Переводим в closed → снова исчезает из ленты.
    await setStatus(page, title, 'closed');
    await page.goto('/apps');

    await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveCount(0);
  });
});

async function setStatus(page: import('@playwright/test').Page, title: string, status: string) {
  await page.goto('/dashboard');
  const form = page.locator('form').filter({ has: page.getByLabel(`Status for ${title}`) });
  await form.getByLabel(`Status for ${title}`).selectOption(status);
  await Promise.all([
    page.waitForResponse(r => r.request().method() === 'POST' && r.status() < 400),
    form.getByRole('button', { name: 'Update status' }).click(),
  ]);
}
