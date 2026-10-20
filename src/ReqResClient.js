import 'dotenv/config';

const CONTEXT_TEST_DELAY_MS = 1000;

/**
 * API client for interacting with the ReqRes API.
 */
export class ReqResClient {
  /**
   * Creates a new ReqRes API client.
   */
  constructor() {
    if (!process.env.API_BASE_URL) {
      throw new Error('API_BASE_URL must be set');
    }

    this.baseUrl = process.env.API_BASE_URL;
    this.apiKey = process.env.REQRES_API_KEY;
  }

  /**
   * Sends an HTTP request to the ReqRes API.
   * @param {string} endpoint - API endpoint.
   * @param {object} options - Fetch request options.
   * @returns {Promise<object>} Parsed JSON response.
   */
  async _request(endpoint, options) {
    const url = new URL(endpoint, this.baseUrl);
    const response = await fetch(url, options);

    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }

    return response.json();
  }

  /**
   * Retrieves a user by ID.
   * @param {number} id - User ID.
   * @returns {Promise<object>} User data.
   */
  async getUser(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('User ID must be a positive integer');
    }

    const endpoint = `/api/users/${id}`;
    const options = {
      headers: {
        'x-api-key': this.apiKey,
      },
    };

    return this._request(endpoint, options);
  }

  /**
   * Retrieves one page of users.
   * @param {number} page - Page number, starting from 1.
   * @returns {Promise<object>} Page payload with data, total and total_pages.
   */
  async getUsers(page) {
    if (!Number.isInteger(page) || page <= 0) {
      throw new Error('Page must be a positive integer');
    }

    const endpoint = `/api/users?page=${page}`;
    const options = {
      headers: {
        'x-api-key': this.apiKey,
      },
    };

    return this._request(endpoint, options);
  }

  /**
   * Creates a new user.
   * @param {object} userData - User data to create.
   * @returns {Promise<object>} Created user data.
   */
  async createUser(userData) {
    if (!userData || typeof userData !== 'object') {
      throw new Error('User data must be a non-null object');
    }

    const endpoint = `/api/users/`;
    const options = {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };

    return this._request(endpoint, options);
  }

  /**
   * Demonstrates lexical this binding with an arrow function.
   * @returns {void}
   */
  testContext() {
    setTimeout(() => {
      // An arrow function does not have its own this; it uses this from the surrounding testContext() context.
      // eslint-disable-next-line no-console
      console.log(this.baseUrl);
    }, CONTEXT_TEST_DELAY_MS);
  }
}
