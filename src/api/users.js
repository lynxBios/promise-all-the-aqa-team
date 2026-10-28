import { randomUUID } from 'node:crypto';
import {
  USERS_ENDPOINT,
  CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
} from '../../config/apiConstants.js';
import {
  BASE_URL,
  NEW_USER_EMAIL_PREFIX,
  NEW_USER_EMAIL_DOMAIN,
  NEW_USER_PASSWORD_PREFIX,
  SECURITY_QUESTION,
  SECURITY_ANSWER,
} from '../../config/testData.js';
import { summarizeErrorBody } from './errors.js';

/**
 * Builds unique credentials for a new test user.
 * @returns {{email: string, password: string}} Email and password that are unique per call.
 */
export function buildUniqueCredentials() {
  const id = randomUUID();
  return {
    email: `${NEW_USER_EMAIL_PREFIX}.${id}@${NEW_USER_EMAIL_DOMAIN}`,
    password: `${NEW_USER_PASSWORD_PREFIX}${id}`,
  };
}

/**
 * Sends a raw registration request and returns the response without checking it.
 * @param {{email: string, password: string}} credentials - User credentials.
 * @returns {Promise<Response>} Raw fetch response.
 */
export async function registerUserRequest({ email, password }) {
  if (!BASE_URL) {
    throw new Error('JUICE_SHOP_URL is not set in .env');
  }

  return fetch(`${BASE_URL}${USERS_ENDPOINT}`, {
    method: 'POST',
    headers: { [CONTENT_TYPE_HEADER]: CONTENT_TYPE.JSON },
    body: JSON.stringify({
      email,
      password,
      passwordRepeat: password,
      securityQuestion: SECURITY_QUESTION,
      securityAnswer: SECURITY_ANSWER,
    }),
  });
}

/**
 * Registers a new user and returns its credentials.
 * @param {{email: string, password: string}} [credentials] - Unique credentials by default.
 * @returns {Promise<{id: number, email: string, password: string}>} Created user.
 * @throws {Error} If the server rejects the registration.
 */
export async function registerUser(credentials = buildUniqueCredentials()) {
  if (
    typeof credentials?.email !== 'string' ||
    typeof credentials?.password !== 'string'
  ) {
    throw new TypeError('registerUser expects { email, password } strings');
  }

  const response = await registerUserRequest(credentials);

  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(
      `Registration failed: HTTP ${response.status} ${summarizeErrorBody(errorBody)}`,
    );
    err.status = response.status;
    throw err;
  }

  const body = await response.json();
  return { id: body.data.id, ...credentials };
}
