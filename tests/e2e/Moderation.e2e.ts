import { expect, test } from '@playwright/test';
import { bypassComingSoon, createCampaign, signInAndOnboard, signOut, USERS } from '../helpers';

// Модерация: 3 анонимных репорта на кампанию → автоскрытие → страница недоступна.
test.describe('Moderation', () => {
  test('three reports hide the campaign', async ({ context, page }) => {
    test.setTimeout(120_000);

    const title = `Reported campaign ${Date.now()}`;

    await signInAndOnboard(context, page, USERS.developer);
    await createCampaign(page, title);

    await page.goto('/apps');
    const card = page.getByRole('link', { name: new RegExp(title) });
    await card.click();
    await page.waitForURL('**/apps/**');
    const appUrl = page.url();

    await signOut(page);

    // Аноним (под обходом заглушки) шлёт 3 репорта на кампанию.
    await bypassComingSoon(context);

    for (let i = 0; i < 3; i++) {
      await page.goto(appUrl);
      // Первый Report-блок на странице относится к самой кампании (test).
      const details = page
        .locator('details')
        .filter({ has: page.locator('select[name="reason"]') })
        .first();
      await details.locator('summary').click();
      await details.locator('select[name="reason"]').selectOption('spam');
      await details.locator('textarea[name="details"]').fill(`Report ${i + 1}`);
      await details.getByRole('button', { name: 'Send report' }).click();
      // Дать серверному действию отработать.
      await page.waitForTimeout(500);
    }

    // После 3-го репорта кампания скрыта → страница отдаёт 404 (notFound).
    const response = await page.goto(appUrl);

    expect(response?.status()).toBe(404);
  });
});
