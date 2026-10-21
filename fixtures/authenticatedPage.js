import { test as base, expect } from '@playwright/test';
import { applicationSetup } from '../utils/applicationSetup.js';
import { LoginPage } from '../pages/LoginPage.js';
import { TEST_USER } from '../config/testData.js';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/#/login');
    await applicationSetup(page);

    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL(/#\/search/);

    await use(page);
  },
});
