import { test, expect } from '@playwright/test';
import { login } from '../../src/api/auth.js';
import { getBasket } from '../../src/api/basket.js';
import { TEST_USER } from '../../config/testData.js';
import {
  HTTP_STATUS,
  CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
} from '../../config/apiConstants.js';

const NO_AUTH_MESSAGE = 'No Authorization header was found';
const BASKET_DATA_FIELD = 'Products';

test('TC-022: basket cannot be read without authorization token', async () => {
  const { bid } = await login(TEST_USER.email, TEST_USER.password);

  const response = await getBasket(undefined, bid);
  const body = await response.text();

  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  expect(response.headers.get(CONTENT_TYPE_HEADER)).toContain(
    CONTENT_TYPE.HTML,
  );
  expect(body).toContain(NO_AUTH_MESSAGE);
  expect(body).not.toContain(BASKET_DATA_FIELD);
});
