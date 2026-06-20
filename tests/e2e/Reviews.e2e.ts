import { expect, test } from '@playwright/test';
import { bypassComingSoon, createCampaign, signInAndOnboard, signOut, USERS } from '../helpers';

// Отзыв с рейтингом: требует авторизации, но НЕ зависит от роли (developer тоже может).
// Анониму форма недоступна (кнопка disabled + ссылка на вход).
test.describe('Reviews require auth, role-independent', () => {
  test('a developer can post a review; anonymous cannot', async ({ context, page }) => {
    test.setTimeout(120_000);

    // Разработчик создаёт кампанию и берёт публичную ссылку.
    await signInAndOnboard(context, page, USERS.developer);
    const title = `Review campaign ${Date.now()}`;
    await createCampaign(page, title);

    await page.goto('/apps');
    const href = await page.getByRole('link', { name: new RegExp(title) }).getAttribute('href');
    const appUrl = href ?? '';

    // Авторизованный пользователь роли developer МОЖЕТ оставить отзыв (роль не важна).
    await page.goto(appUrl);
    const body = `Developer review ${Date.now()}`;
    await page.locator('textarea[name="body"]').fill(body);
    await page.locator('select[name="rating"]').selectOption('4');

    await expect(page.getByRole('button', { name: 'Post review' })).toBeEnabled();

    await page.getByRole('button', { name: 'Post review' }).click();

    await expect(page.getByText(body)).toBeVisible();

    // Аноним: форма недоступна — кнопка disabled, есть ссылка на вход.
    await signOut(page);
    await bypassComingSoon(context);
    await page.goto(appUrl);

    await expect(page.getByRole('button', { name: 'Post review' })).toBeDisabled();
    await expect(page.getByText(/Sign in.*to leave a review/)).toBeVisible();
  });
});
