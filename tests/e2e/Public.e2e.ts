import { expect, test } from '@playwright/test';
import { bypassComingSoon } from '../helpers';

// Публичные/маркетинговые страницы. Обход заглушки Coming Soon — preview-cookie.
test.describe('Public pages', () => {
  test.beforeEach(async ({ context }) => {
    await bypassComingSoon(context);
  });

  test('landing renders hero and CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Real-device testing by real people' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse apps' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Become a tester' })).toBeVisible();
  });

  test('header is present with shared navigation', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');

    await expect(header.getByRole('link', { name: 'How it works' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Browse' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Toplist' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'FAQ' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('marketing sub-pages open', async ({ page }) => {
    await page.goto('/how-it-works');

    await expect(page).toHaveURL(/\/how-it-works$/);

    await page.goto('/faq');

    await expect(page).toHaveURL(/\/faq$/);

    await page.goto('/toplist');

    await expect(page).toHaveURL(/\/toplist$/);
  });

  test('browse apps feed renders with platform filters', async ({ page }) => {
    await page.goto('/apps');

    await expect(page.getByRole('heading', { name: 'Browse apps' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'All', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ios', exact: true })).toBeVisible();

    // Фильтр по платформе меняет URL.
    await page.getByRole('link', { name: 'android', exact: true }).click();

    await expect(page).toHaveURL(/platform=android/);
  });

  test('language switch en -> uk changes locale', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitemradio', { name: 'Українська' }).click();

    await expect(page).toHaveURL(/\/uk(\/|$)/);
    await expect(page.getByRole('button', { name: 'Змінити мову' })).toBeVisible();
  });
});
