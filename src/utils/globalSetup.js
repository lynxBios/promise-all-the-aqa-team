import { registerUserRequest } from '../api/users.js';
import { summarizeErrorBody } from '../api/errors.js';
import { TEST_USER, TEST_USER_B } from '../../config/testData.js';

const BAD_REQUEST_STATUS = 400;
const EMAIL_FIELD = 'email';
const EMAIL_TAKEN_MESSAGE = 'email must be unique';

/**
 * Checks that credentials are present before any request is sent.
 * @param {string} name - Label used in the error message.
 * @param {{email?: string, password?: string}} user - Credentials to check.
 * @throws {Error} If email or password is missing.
 */
function assertCredentials(name, user) {
  if (!user.email || !user.password) {
    throw new Error(`${name} email or password is not set in environment`);
  }
}

/**
 * Tells whether a registration response means the email already exists.
 * @param {Response} response - Raw registration response.
 * @returns {Promise<boolean>} True if the server reported a duplicate email.
 */
async function isEmailTaken(response) {
  if (response.status !== BAD_REQUEST_STATUS) {
    return false;
  }
  const body = await response.json();
  return (body.errors ?? []).some(
    (error) =>
      error.field === EMAIL_FIELD && error.message === EMAIL_TAKEN_MESSAGE,
  );
}

/**
 * Registers a shared test user, or accepts that it already exists.
 * @param {string} name - Label used in the error message.
 * @param {{email: string, password: string}} user - Credentials to register.
 * @throws {Error} If registration fails for any reason other than a duplicate email.
 */
async function ensureUser(name, user) {
  assertCredentials(name, user);

  const response = await registerUserRequest(user);
  if (response.ok || (await isEmailTaken(response))) {
    return;
  }

  const errorBody = await response.text();
  throw new Error(
    `${name} registration failed: HTTP ${response.status} ${summarizeErrorBody(errorBody)}`,
  );
}

/**
 * Playwright global setup: makes sure both shared test users exist.
 */
export default async function globalSetup() {
  await ensureUser('TEST_USER', TEST_USER);
  await ensureUser('TEST_USER_B', TEST_USER_B);
}
