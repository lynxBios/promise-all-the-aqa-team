import { test, expect } from '@playwright/test';
import { login } from '../../src/api/auth.js';
import {
  getBasket,
  addToBasket,
  removeBasketItem,
} from '../../src/api/basket.js';
import {
  TEST_USER,
  APPLE_JUICE_ID,
  DEFAULT_QUANTITY,
} from '../../config/testData.js';
import {
  HTTP_STATUS,
  CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
  RESPONSE_STATUS_SUCCESS,
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

test.describe('own basket', () => {
  let token;
  let bid;
  let itemId;

  test.beforeEach(async () => {
    ({ token, bid } = await login(TEST_USER.email, TEST_USER.password));
    itemId = undefined;
  });

  test.afterEach(async () => {
    if (itemId) {
      await removeBasketItem(token, itemId);
    }
  });

  test('TC-019: own basket contains the added product', async () => {
    const item = await addToBasket(token, {
      ProductId: APPLE_JUICE_ID,
      BasketId: String(bid),
      quantity: DEFAULT_QUANTITY,
    });
    itemId = item.id;

    const response = await getBasket(token, bid);
    const body = await response.json();

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(body.status).toBe(RESPONSE_STATUS_SUCCESS);
    expect(body.data.id).toBe(bid);

    const product = body.data.Products.find((p) => p.id === APPLE_JUICE_ID);
    expect(product).toBeDefined();
    expect(product.BasketItem).toMatchObject({
      ProductId: APPLE_JUICE_ID,
      BasketId: bid,
      quantity: DEFAULT_QUANTITY,
    });
  });
});
