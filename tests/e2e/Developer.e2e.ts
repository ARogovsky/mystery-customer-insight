import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { signInAndOnboard, USERS } from '../helpers';

// Поток разработчика: онбординг → Submit an app → список → клик по айтему → сабмишны.
// e2e БД (PGLite) изолирована, поэтому каждый прогон строит своё состояние.

async function fillAndSubmitApp(page: Page, title: string) {
  await page.locator('input[name="appName"]').fill(`App for ${title}`);
  await page.locator('input[name="appUrl"]').fill('https://example.com/app');
  await page.locator('textarea[name="description"]').fill('Short description');
  await page.locator('input[name="platforms"][value="web"]').check();
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="scenario"]').fill('Open the app and try the main flow.');
  await page.locator('input[name="q_prompt_0"]').fill('Did it work?');
  await page.locator('select[name="q_type_0"]').selectOption('boolean');

  await page.getByRole('button', { name: 'Submit app' }).click();
  await page.waitForURL('**/dashboard');
}

test.describe('Developer flow', () => {
  test('submit an app, then open its submissions from the list', async ({ context, page }) => {
    await signInAndOnboard(context, page, USERS.developer);

    const title = `Test campaign ${Date.now()}`;

    // Нет публикаций → форма прямо на /dashboard; иначе идём на /dashboard/apps/new.
    const firstAppHeading = page.getByRole('heading', { name: 'Submit your first app' });
    if (!(await firstAppHeading.isVisible().catch(() => false))) {
      await page.getByRole('link', { name: 'Submit an app' }).first().click();
      await page.waitForURL('**/dashboard/apps/new');
    }

    await fillAndSubmitApp(page, title);

    // Приложение появилось в списке "Your apps".
    await expect(page.getByRole('heading', { name: 'Your apps' })).toBeVisible();

    const item = page.getByRole('link', { name: title });

    await expect(item).toBeVisible();

    // КЛИК ПО АЙТЕМУ → страница сабмишнов кампании (репорт-баг: проверяем).
    await item.click();
    await page.waitForURL('**/dashboard/apps/**/submissions');

    await expect(
      page.getByRole('heading', { name: new RegExp(`Submissions —\\s*${title}`) }),
    ).toBeVisible();
    await expect(page.getByText('No submissions yet.')).toBeVisible();
  });

  test('new app appears in the public feed', async ({ context, page }) => {
    await signInAndOnboard(context, page, USERS.developer);

    const title = `Feed campaign ${Date.now()}`;

    const firstAppHeading = page.getByRole('heading', { name: 'Submit your first app' });
    if (!(await firstAppHeading.isVisible().catch(() => false))) {
      await page.getByRole('link', { name: 'Submit an app' }).first().click();
      await page.waitForURL('**/dashboard/apps/new');
    }

    await fillAndSubmitApp(page, title);

    // Публичная лента показывает открытую кампанию, клик по карточке → страница приложения.
    await page.goto('/apps');
    const card = page.getByRole('link', { name: new RegExp(title) });

    await expect(card).toBeVisible();
    // В листинге видны статус и число отчётов (публично).
    await expect(card).toContainText('open');
    await expect(card).toContainText('reports');

    await card.click();
    await page.waitForURL('**/apps/**');

    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Test scenario' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Submit a report' })).toBeVisible();
    // Отчёты приватны: публичной ссылки на результаты нет.
    await expect(page.getByRole('link', { name: 'View results' })).toHaveCount(0);
  });
});
