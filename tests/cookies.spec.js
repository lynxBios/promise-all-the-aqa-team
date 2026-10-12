import { test, expect } from '@playwright/test';

test('user can accept cookies', async ({ page }) => {
  await page.goto('http://localhost:3000/#/');
  await page.getByRole('button', { name: 'dismiss cookie message' }).click();

  await expect(
    page.getByRole('dialog', { name: 'cookieconsent' }),
  ).not.toBeVisible();
});
