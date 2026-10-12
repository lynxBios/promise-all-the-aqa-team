import { test as base } from '@playwright/test';
import { applicationSetup } from '../utils/applicationSetup.js';
import { LoginPage } from '../pages/LoginPage.js';
import { TEST_USER } from '../config/testData.js';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/#/login');
    await applicationSetup(page);

    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await use(page);
  },
});
