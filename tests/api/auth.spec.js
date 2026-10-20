import { test, expect } from '@playwright/test';
import { loginRequest } from '../../src/api/auth.js';
import { TEST_USER, INVALID_PASSWORD } from '../../config/testData.js';
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

const INVALID_LOGIN_CASES = [
  {
    id: 'TC-002',
    title: 'wrong password',
    email: TEST_USER.email,
    password: INVALID_PASSWORD,
  },
  {
    id: 'TC-003',
    title: 'non-existent email',
    email: 'no.such.user@test.com',
    password: 'whatever-123',
  },
  {
    id: 'TC-004',
    title: 'empty email and password',
    email: '',
    password: '',
  },
];

for (const { id, title, email, password } of INVALID_LOGIN_CASES) {
  test(`${id}: login with ${title} returns 401 without token`, async () => {
    const response = await loginRequest(email, password);
    // Body is plain text (text/html), not JSON, so read it as text
    const bodyText = await response.text();

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(bodyText).toContain('Invalid email or password.');
    expect(bodyText).not.toContain('token');
  });
}
