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

/**
 * Logs in and returns the authentication data from the response.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<{token: string, bid: number, umail: string}>} Authentication data.
 * @throws {Error} If the server rejects the login or the response has no token.
 */
export async function login(email, password) {
  const response = await loginRequest(email, password);

  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(`Login failed: HTTP ${response.status} ${errorBody}`);
    err.status = response.status;
    throw err;
  }

  const body = await response.json();

  if (!body.authentication?.token) {
    throw new Error('Login response has no authentication.token');
  }

  return body.authentication;
}
