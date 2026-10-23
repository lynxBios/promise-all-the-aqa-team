import { test, expect } from '@playwright/test';
import { ReqResClient } from '../../src/ReqResClient.js';
import { fetchAllPages } from '../../src/api/pagination.js';

const MIN_PAGES_FOR_PAGINATION = 2;

test.describe('ReqRes pagination', () => {
  let result;

  test.beforeAll(async () => {
    const client = new ReqResClient();
    // Arrow function keeps `this` bound to the client instance.
    result = await fetchAllPages((page) => client.getUsers(page));
  });

  test('fetches more than one page', () => {
    expect(
      result.pagesFetched,
      'Pagination is not exercised with a single page',
    ).toBeGreaterThanOrEqual(MIN_PAGES_FOR_PAGINATION);
  });

  test('collected item count equals total from API', () => {
    expect(result.items).toHaveLength(result.total);
  });

  test('item ids are not repeated across pages', () => {
    const ids = result.items.map((item) => item.id);

    expect(new Set(ids).size, 'Duplicate ids found across pages').toBe(
      ids.length,
    );
  });
});
