import { expect, test } from '@playwright/test';
import { signInAndOnboard, signOut, USERS } from '../helpers';

// Пункт [1] бэклога: choice-вопросы. Разработчик создаёт кампанию с choice-вопросом,
// варианты видны публично и в форме отчёта, тестер выбирает вариант и шлёт отчёт.
test.describe('Choice questions', () => {
  test('create campaign with a choice question, display options, tester answers', async ({ context, page }) => {
    test.setTimeout(120_000);

    await signInAndOnboard(context, page, USERS.developer);

    const title = `Choice campaign ${Date.now()}`;
    await page.goto('/dashboard/apps/new');
    await page.locator('input[name="appName"]').fill(`App for ${title}`);
    await page.locator('input[name="appUrl"]').fill('https://example.com/app');
    await page.locator('input[name="platforms"][value="web"]').check();
    await page.locator('input[name="title"]').fill(title);
    await page.locator('textarea[name="scenario"]').fill('Pick something.');
    await page.locator('input[name="q_prompt_0"]').fill('Pick a color');
    await page.locator('select[name="q_type_0"]').selectOption('choice');
    await page.locator('input[name="q_options_0"]').fill('Red, Green, Blue');
    await page.getByRole('button', { name: 'Submit app' }).click();
    await page.waitForURL('**/dashboard');

    // Публичная страница приложения показывает вопрос и его варианты.
    await page.goto('/apps');
    await page.getByRole('link', { name: new RegExp(title) }).click();
    await page.waitForURL('**/apps/**');
    const appUrl = page.url();

    await expect(page.getByText('Pick a color')).toBeVisible();
    await expect(page.getByText('Red, Green, Blue')).toBeVisible();

    await signOut(page);

    // Тестер видит choice как select с вариантами и отправляет ответ.
    await signInAndOnboard(context, page, USERS.tester);
    await page.goto(appUrl);
    await page.getByRole('link', { name: 'Submit a report' }).click();
    await page.waitForURL('**/dashboard/reports/new/**');

    const choice = page.getByRole('combobox');

    await expect(choice).toBeVisible();

    await choice.selectOption('Green');
    await page.locator('textarea[name="freeText"]').fill('Chose green');
    await page.getByRole('button', { name: 'Submit report' }).click();
    await page.waitForURL('**/dashboard');

    await expect(page.getByRole('link', { name: title })).toBeVisible();
  });
});
