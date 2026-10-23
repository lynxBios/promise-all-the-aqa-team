import 'dotenv/config';
import { defineConfig } from '@playwright/test';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const BASE_URL = process.env.JUICE_SHOP_URL || DEFAULT_BASE_URL;
const IS_CI = Boolean(process.env.CI);
const CI_WORKERS = 1;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  globalSetup: './src/utils/globalSetup.js',
  forbidOnly: IS_CI,
  workers: IS_CI ? CI_WORKERS : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    { name: 'ui', testDir: './tests/ui' },
    { name: 'api', testDir: './tests/api' },
  ],
});
