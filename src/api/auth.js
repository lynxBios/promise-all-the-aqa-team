import { BASE_URL } from '../../config/testData.js';

const LOGIN_PATH = '/rest/user/login';

/**
 * Sends a raw login request and returns the response without checking it.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<Response>} Raw fetch response.
 */
export async function loginRequest(email, password) {
  if (!BASE_URL) {
    throw new Error('JUICE_SHOP_URL is not set in .env');
  }

  return fetch(`${BASE_URL}${LOGIN_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}
