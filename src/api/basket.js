import { BASE_URL } from '../../config/testData.js';

const BASKET_PATH = '/rest/basket';

/**
 * Sends a raw request to read a basket and returns the response unchecked.
 * @param {string | undefined} token - JWT; if omitted, no Authorization header is sent.
 * @param {number | string} bid - Basket id.
 * @returns {Promise<Response>} Raw fetch response.
 */
export async function getBasket(token, bid) {
  if (!BASE_URL) {
    throw new Error('JUICE_SHOP_URL is not set in .env');
  }

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${BASKET_PATH}/${bid}`, { headers });
}
