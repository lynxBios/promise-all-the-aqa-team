import { test, expect } from '@playwright/test';
import { registerUser } from '../../src/api/users.js';
import { login } from '../../src/api/auth.js';
import { searchProducts } from '../../src/api/products.js';
import {
  getBasket,
  addToBasket,
  removeBasketItem,
} from '../../src/api/basket.js';
import {
  TEST_USER,
  TEST_USER_B,
  APPLE_JUICE_ID,
  APPLE_POMACE_ID,
  DEFAULT_QUANTITY,
  APPLE_SEARCH_QUERY,
  APPLE_JUICE_NAME,
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
    const user = await registerUser();
    ({ token, bid } = await login(user.email, user.password));
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

test.describe("another user's basket", () => {
  let tokenA;
  let tokenB;
  let bidB;
  let itemIdB;

  test.beforeEach(async () => {
    ({ token: tokenA } = await login(TEST_USER.email, TEST_USER.password));
    ({ token: tokenB, bid: bidB } = await login(
      TEST_USER_B.email,
      TEST_USER_B.password,
    ));
    itemIdB = undefined;
  });

  test.afterEach(async () => {
    if (itemIdB) {
      await removeBasketItem(tokenB, itemIdB);
    }
  });

  test('TC-025: basket of another user is readable with own token (known defect)', async () => {
    const item = await addToBasket(tokenB, {
      ProductId: APPLE_POMACE_ID,
      BasketId: String(bidB),
      quantity: DEFAULT_QUANTITY,
    });
    itemIdB = item.id;

    const ownerBody = await (await getBasket(tokenB, bidB)).json();

    // Known defect: access should be denied (403), actual behavior is 200 with foreign data.
    const response = await getBasket(tokenA, bidB);
    const body = await response.json();

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toContain(
      CONTENT_TYPE.JSON,
    );
    expect(body.status).toBe(RESPONSE_STATUS_SUCCESS);
    expect(body.data.id).toBe(bidB);
    expect(body.data.UserId).toBe(ownerBody.data.UserId);
    expect(body.data.Products.map((p) => p.id)).toContain(APPLE_POMACE_ID);
  });
});

test.describe('end-to-end flow', () => {
  let user;
  let token;
  let itemId;

  test.beforeEach(async () => {
    user = await registerUser();
    token = undefined;
    itemId = undefined;
  });

  test.afterEach(async () => {
    if (token && itemId) {
      await removeBasketItem(token, itemId);
    }
  });

  test('TC-029: login, search, add to basket, verify basket', async () => {
    const auth = await login(user.email, user.password);
    token = auth.token;
    expect(typeof auth.token).toBe('string');
    expect(auth.token).not.toBe('');
    expect(typeof auth.bid).toBe('number');

    const products = await searchProducts(APPLE_SEARCH_QUERY);
    const appleJuice = products.find((p) =>
      p.name.startsWith(APPLE_JUICE_NAME),
    );
    expect(appleJuice).toBeDefined();
    expect(typeof appleJuice.id).toBe('number');

    const basketBefore = await (await getBasket(token, auth.bid)).json();

    const item = await addToBasket(token, {
      ProductId: appleJuice.id,
      BasketId: String(auth.bid),
      quantity: DEFAULT_QUANTITY,
    });
    itemId = item.id;
    expect(typeof item.id).toBe('number');
    expect(item.ProductId).toBe(appleJuice.id);
    expect(item.BasketId).toBe(String(auth.bid));
    expect(item.quantity).toBe(DEFAULT_QUANTITY);

    const response = await getBasket(token, auth.bid);
    const basketAfter = await response.json();

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(basketAfter.data.id).toBe(auth.bid);
    expect(basketAfter.data.Products.length).toBe(
      basketBefore.data.Products.length + 1,
    );

    const product = basketAfter.data.Products.find(
      (p) => p.id === appleJuice.id,
    );
    expect(product).toBeDefined();
    expect(product.BasketItem.quantity).toBe(DEFAULT_QUANTITY);
  });
});
