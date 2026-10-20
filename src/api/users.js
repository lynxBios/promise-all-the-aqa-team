import { randomUUID } from 'node:crypto';
import {
  BASE_URL,
  USERS_ENDPOINT,
  CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
  ERROR_BODY_MAX_LENGTH,
} from '../../config/apiConstants.js';
import {
  NEW_USER_EMAIL_PREFIX,
  NEW_USER_EMAIL_DOMAIN,
  NEW_USER_PASSWORD_PREFIX,
  SECURITY_QUESTION,
  SECURITY_ANSWER,
} from '../../config/testData.js';

/**
 * Builds unique credentials for a new test user.
 * @returns {{email: string, password: string}}
 */
export function buildUniqueCredentials() {
  const id = randomUUID();
  return {
    email: `${NEW_USER_EMAIL_PREFIX}.${id}@${NEW_USER_EMAIL_DOMAIN}`,
    password: `${NEW_USER_PASSWORD_PREFIX}${id}`,
  };
}

/**
 * Sends the registration request and returns the raw Response (for negative tests).
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<Response>}
 */
export function registerUserRequest({ email, password }) {
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
 * Registers a user and throws if the server does not accept it.
 * @param {{email: string, password: string}} [credentials] unique credentials by default
 * @returns {Promise<{id: number, email: string, password: string}>}
 */
export async function registerUser(credentials = buildUniqueCredentials()) {
  const response = await registerUserRequest(credentials);
  if (!response.ok) {
    const text = await response.text();
    const err = new Error(
      `Registration failed: HTTP ${response.status}: ${text.slice(0, ERROR_BODY_MAX_LENGTH)}`,
    );
    err.status = response.status;
    throw err;
  }
  const body = await response.json();
  return { id: body.data.id, ...credentials };
}
