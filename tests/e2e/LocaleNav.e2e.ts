import { expect, test } from '@playwright/test';
import { createCampaign, signInAndOnboard, USERS } from '../helpers';

// Навигация по внутренним ссылкам должна сохранять локаль. Раньше dashboard/публичные
// страницы использовали обычный next/link → клик по айтему на /uk терял префикс локали.
test.describe('Locale-aware navigation', () => {
  test('clicking a dashboard item on /uk keeps the uk locale', async ({ context, page }) => {
    test.setTimeout(120_000);

    await signInAndOnboard(context, page, USERS.developer);

    const title = `UK nav campaign ${Date.now()}`;
    await createCampaign(page, title);

    // Открываем дашборд под украинской локалью.
    await page.goto('/uk/dashboard');
    const item = page.getByRole('link', { name: title });

    await expect(item).toBeVisible();

    await item.click();

    // Должны остаться под /uk, а не уехать на дефолтную локаль.
    await expect(page).toHaveURL(/\/uk\/dashboard\/apps\/.+\/submissions/);
  });

  test('clicking a public feed card on /uk keeps the uk locale', async ({ context, page }) => {
    test.setTimeout(120_000);

    await signInAndOnboard(context, page, USERS.developer);
    const title = `UK feed campaign ${Date.now()}`;
    await createCampaign(page, title);

    await page.goto('/uk/apps');
    const card = page.getByRole('link', { name: new RegExp(title) });

    await expect(card).toBeVisible();

    await card.click();

    await expect(page).toHaveURL(/\/uk\/apps\/.+/);
  });
});
