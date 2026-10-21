import { test, expect } from '@playwright/test';
import { searchProductsRequest } from '../../src/api/products.js';
import { validateSchema } from '../../src/utils/schemaValidator.js';
import { SEARCH_RESPONSE_SCHEMA } from '../../src/api/schemas.js';
import {
  EMPTY_QUERY,
  NO_MATCH_QUERY,
  APPLE_JUICE_ID,
  APPLE_POMACE_ID,
  PINEAPPLE_JUICE_ID,
  CATALOG_SIZE,
} from '../../config/testData.js';
import {
  HTTP_STATUS,
  CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
  RESPONSE_STATUS_SUCCESS,
} from '../../config/apiConstants.js';

test('TC-011: empty query returns the whole catalog', async () => {
  const response = await searchProductsRequest(EMPTY_QUERY);
  const body = await response.json();

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.headers.get(CONTENT_TYPE_HEADER)).toContain(
    CONTENT_TYPE.JSON,
  );

  const { valid, errors } = validateSchema(SEARCH_RESPONSE_SCHEMA, body);

  expect(valid, errors).toBe(true);
  expect(body.status).toBe(RESPONSE_STATUS_SUCCESS);
  expect(body.data).toHaveLength(CATALOG_SIZE);

  const ids = body.data.map((p) => p.id);

  expect(ids).toEqual(
    expect.arrayContaining([
      APPLE_JUICE_ID,
      APPLE_POMACE_ID,
      PINEAPPLE_JUICE_ID,
    ]),
  );
});

test('TC-014: query without matches returns an empty list', async () => {
  const response = await searchProductsRequest(NO_MATCH_QUERY);
  const body = await response.json();

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.headers.get(CONTENT_TYPE_HEADER)).toContain(
    CONTENT_TYPE.JSON,
  );
  expect(body.status).toBe(RESPONSE_STATUS_SUCCESS);
  expect(body.data).toEqual([]);
});
