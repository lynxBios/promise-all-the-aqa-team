import { test, expect } from '@playwright/test';

test('user can accept cookies', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Close Welcome Banner' }).click();
  await page.getByRole('button', { name: 'dismiss cookie message' }).click();

  await expect(
    page.getByRole('dialog', { name: 'cookieconsent' }),
  ).toBeHidden();
});
