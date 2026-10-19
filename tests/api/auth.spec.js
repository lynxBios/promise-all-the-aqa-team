import { test, expect } from '@playwright/test';
import { loginRequest } from '../../src/api/auth.js';
import { TEST_USER } from '../../config/testData.js';
import {
  HTTP_STATUS,
  CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
} from '../../config/apiConstants.js';

const JWT_PARTS_COUNT = 3;

test('TC-001: login with valid credentials returns token, bid and umail', async () => {
  const response = await loginRequest(TEST_USER.email, TEST_USER.password);

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.headers.get(CONTENT_TYPE_HEADER)).toContain(
    CONTENT_TYPE.JSON,
  );

  const { token, bid, umail } = (await response.json()).authentication;

  expect(typeof token).toBe('string');
  expect(token.split('.')).toHaveLength(JWT_PARTS_COUNT);
  expect(umail).toBe(TEST_USER.email);
  expect(typeof bid).toBe('number');
});
