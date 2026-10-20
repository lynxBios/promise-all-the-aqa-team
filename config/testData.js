export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
};

export const TEST_USER_B = {
  email: process.env.TEST_USER_B_EMAIL,
  password: process.env.TEST_USER_B_PASSWORD,
};

export const BASE_URL = process.env.JUICE_SHOP_URL;
export const INVALID_PASSWORD = 'wrong-password';
export const APPLE_JUICE_ID = 1;
export const APPLE_POMACE_ID = 24;
export const PINEAPPLE_JUICE_ID = 47;
export const ORANGE_JUICE_ID = 2;
export const NON_EXISTENT_PRODUCT_ID = 999999;
export const CATALOG_SIZE = 46;
export const DEFAULT_QUANTITY = 1;
export const EMPTY_QUERY = '';
export const NO_MATCH_QUERY = 'zzzzzz';
export const APPLE_SEARCH_QUERY = 'apple';
export const APPLE_JUICE_NAME = 'Apple Juice';
export const NEW_USER_EMAIL_PREFIX = 'qa.user';
export const NEW_USER_EMAIL_DOMAIN = 'test.com';
export const NEW_USER_PASSWORD_PREFIX = 'Pw-';
export const SECURITY_QUESTION = {
  id: 1,
  question: 'Your eldest siblings middle name?',
};
export const SECURITY_ANSWER = 'qa-answer';
