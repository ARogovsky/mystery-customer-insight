import { expect, test } from '@playwright/test';
import { createCampaign, signUpAndOnboard } from '../helpers';

// Регистрация новых тест-юзеров на лету (+clerk_test, код 424242) — без ручного
// создания в Clerk. Проверяем, что свежий юзер регистрируется и онбордится.
test.describe('Sign-up of fresh test users', () => {
  test('a brand-new tester can sign up and is onboarded', async ({ context, page }) => {
    test.setTimeout(120_000);

    const email = `mci-e2e-tester-${Date.now()}+clerk_test@example.com`;
    await signUpAndOnboard(context, page, { email, role: 'tester' });

    await expect(page.getByRole('heading', { name: 'My reports' })).toBeVisible();
  });

  test('a brand-new developer with a display name shows as author publicly', async ({ context, page }) => {
    test.setTimeout(120_000);

    const stamp = Date.now();
    const email = `mci-e2e-dev-${stamp}+clerk_test@example.com`;
    const devName = `Fresh Dev ${stamp}`;
    await signUpAndOnboard(context, page, { email, role: 'developer' }, devName);

    const title = `Signup campaign ${stamp}`;
    await createCampaign(page, title);

    await page.goto('/apps');
    await page.getByRole('link', { name: new RegExp(title) }).click();
    await page.waitForURL('**/apps/**');

    await expect(page.getByText(`by ${devName}`)).toBeVisible();
  });
});
