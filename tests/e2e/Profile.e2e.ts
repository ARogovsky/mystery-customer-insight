import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { createCampaign, signInAndOnboard, signOut, USERS } from '../helpers';

// Пункты [3] display_name и [4] tests_completed.
test.describe('Profile: display name & tests completed', () => {
  test('display name from onboarding shows on the public app page', async ({ context, page }) => {
    test.setTimeout(120_000);

    const devName = `Acme Dev ${Date.now()}`;
    // dev2 не используется другими тестами → в изолированной БД профиль свежий,
    // экран онбординга появится и имя сохранится.
    await signInAndOnboard(context, page, USERS.dev2, devName);

    const title = `Named campaign ${Date.now()}`;
    await createCampaign(page, title);

    await page.goto('/apps');
    await page.getByRole('link', { name: new RegExp(title) }).click();
    await page.waitForURL('**/apps/**');

    await expect(page.getByText(`by ${devName}`)).toBeVisible();
  });

  test('tests_completed increments by one per submitted report', async ({ context, page }) => {
    test.setTimeout(120_000);

    // Разработчик готовит открытую кампанию.
    await signInAndOnboard(context, page, USERS.developer);
    const title = `Stats campaign ${Date.now()}`;
    await createCampaign(page, title);

    await page.goto('/apps');
    await page.getByRole('link', { name: new RegExp(title) }).click();
    await page.waitForURL('**/apps/**');
    const appUrl = page.url();

    await signOut(page);

    // Тестер: фиксируем текущее число завершённых тестов, шлём отчёт, проверяем +1.
    await signInAndOnboard(context, page, USERS.tester);
    const before = await readTestsCompleted(page);

    await page.goto(appUrl);
    await page.getByRole('link', { name: 'Submit a report' }).click();
    await page.waitForURL('**/dashboard/reports/new/**');
    await page.locator('textarea[name="freeText"]').fill('Done');
    await page.getByRole('button', { name: 'Submit report' }).click();
    await page.waitForURL('**/dashboard');

    const after = await readTestsCompleted(page);

    expect(after).toBe(before + 1);
  });
});

async function readTestsCompleted(page: Page): Promise<number> {
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'My reports' })).toBeVisible();

  const text = (await page.getByText(/Tests completed:/).textContent()) ?? '';
  const match = text.match(/Tests completed:\s*(\d+)/);

  return match ? Number(match[1]) : 0;
}
