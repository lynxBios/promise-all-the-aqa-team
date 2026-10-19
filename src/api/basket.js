import { BASE_URL } from '../../config/testData.js';

const BASKET_PATH = '/rest/basket';
const BASKET_ITEMS_PATH = '/api/BasketItems/';
const ERROR_BODY_MAX_LENGTH = 200;

function requireBaseUrl() {
  if (!BASE_URL) {
    throw new Error('JUICE_SHOP_URL is not set in .env');
  }
  return BASE_URL;
}

function buildHeaders(token, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Sends a raw request to read a basket and returns the response unchecked.
 * @param {string | undefined} token - JWT; if omitted, no Authorization header is sent.
 * @param {number | string} bid - Basket id.
 * @returns {Promise<Response>} Raw fetch response.
 */
export async function getBasket(token, bid) {
  return fetch(`${requireBaseUrl()}${BASKET_PATH}/${bid}`, {
    headers: buildHeaders(token),
  });
}

/**
 * Sends a raw request to add an item to a basket and returns the response unchecked.
 * @param {string | undefined} token - JWT; if omitted, no Authorization header is sent.
 * @param {{ProductId: number, BasketId: number | string, quantity: number}} item - Request body as is.
 * @returns {Promise<Response>} Raw fetch response.
 */
export async function addToBasketRequest(token, item) {
  return fetch(`${requireBaseUrl()}${BASKET_ITEMS_PATH}`, {
    method: 'POST',
    headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(item),
  });
}

/**
 * Adds an item to a basket and returns the created basket item.
 * @param {string} token - JWT.
 * @param {{ProductId: number, BasketId: number | string, quantity: number}} item - Request body.
 * @returns {Promise<{id: number, ProductId: number, BasketId: string, quantity: number}>} Created item.
 * @throws {Error} If the server rejects the request.
 */
export async function addToBasket(token, item) {
  const response = await addToBasketRequest(token, item);

  if (!response.ok) {
    const errorBody = (await response.text()).slice(0, ERROR_BODY_MAX_LENGTH);
    const err = new Error(
      `Add to basket failed: HTTP ${response.status} ${errorBody}`,
    );
    err.status = response.status;
    throw err;
  }

  return (await response.json()).data;
}
