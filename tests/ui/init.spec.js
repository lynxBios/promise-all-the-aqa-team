import { test, expect } from '@playwright/test';

test('application opens successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/#/');

  await page.getByRole('button', { name: 'Close Welcome Banner' }).click();
  await page.getByLabel('dismiss cookie message').click();

  await expect(page.locator('h2')).toHaveText('OWASP Juice Shop');
});
