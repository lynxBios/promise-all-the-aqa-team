import { test, expect } from '@playwright/test';
import { INVALID_PASSWORD, TEST_USER } from '../config/testData.js';
import { LoginPage } from '../pages/LoginPage.js';
import { applicationSetup } from '../utils/applicationSetup.js';

const LOGIN_TEST_CASES = [
  {
    name: 'user can log in with valid credentials',
    email: TEST_USER.email,
    password: TEST_USER.password,
    expectedResult: 'success',
  },
  {
    name: 'user cannot log in with invalid password',
    email: TEST_USER.email,
    password: INVALID_PASSWORD,
    expectedResult: 'error',
  },
  {
    name: 'user cannot log in with empty email',
    email: '',
    password: TEST_USER.password,
    expectedResult: 'disabled',
  },
];

test.beforeEach(async ({ page }) => {
  await page.goto('/#/login');
  await applicationSetup(page);
});

for (const testCase of LOGIN_TEST_CASES) {
  test(testCase.name, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.fillLoginForm(testCase.email, testCase.password);

    if (testCase.expectedResult === 'disabled') {
      await expect(loginPage.isLoginButtonDisabled()).resolves.toBe(true);

      return;
    }

    await loginPage.clickLogin();

    if (testCase.expectedResult === 'success') {
      await expect(page).toHaveURL(/#\/search$/);
      return;
    }

    await expect(page.locator('.error')).toHaveText(
      'Invalid email or password.',
    );
  });
}
