import { SEARCH_ENDPOINT } from '../../config/apiConstants.js';
import { BASE_URL } from '../../config/testData.js';
import { summarizeErrorBody } from './errors.js';

/**
 * Sends a raw product search request and returns the response without checking it.
 * @param {string} query - Search string for the q parameter.
 * @returns {Promise<Response>} Raw fetch response.
 */
export async function searchProductsRequest(query) {
  if (!BASE_URL) {
    throw new Error('JUICE_SHOP_URL is not set in .env');
  }

  const params = new URLSearchParams({ q: query });
  return fetch(`${BASE_URL}${SEARCH_ENDPOINT}?${params}`);
}

/**
 * Searches products and returns the list of matches.
 * @param {string} query - Search string for the q parameter.
 * @returns {Promise<Array<{id: number, name: string, price: number}>>} Matching products.
 * @throws {Error} If the server rejects the request.
 */
export async function searchProducts(query) {
  const response = await searchProductsRequest(query);

  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(
      `Search failed: HTTP ${response.status} ${summarizeErrorBody(errorBody)}`,
    );
    err.status = response.status;
    throw err;
  }

  const body = await response.json();
  return body.data;
}
