/** Schema of POST /rest/user/login response. */
export const LOGIN_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    authentication: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        bid: { type: 'number' },
        umail: { type: 'string' },
      },
      required: ['token', 'bid', 'umail'],
    },
  },
  required: ['authentication'],
};

/** Schema of a single product in GET /rest/products/search response. */
export const PRODUCT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
  },
  required: ['id', 'name', 'description', 'price'],
};

/** Schema of GET /rest/products/search response. */
export const SEARCH_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    data: { type: 'array', items: PRODUCT_SCHEMA },
  },
  required: ['status', 'data'],
};

/** Schema of POST /api/BasketItems/ response data (BasketId is a string here). */
export const ADDED_BASKET_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    ProductId: { type: 'number' },
    BasketId: { type: 'string' },
    quantity: { type: 'number' },
  },
  required: ['id', 'ProductId', 'BasketId', 'quantity'],
};

/** Schema of GET /rest/basket/{bid} response. */
export const BASKET_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        UserId: { type: 'number' },
        Products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              price: { type: 'number' },
              BasketItem: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  ProductId: { type: 'number' },
                  BasketId: { type: 'number' },
                  quantity: { type: 'number' },
                },
                required: ['id', 'ProductId', 'BasketId', 'quantity'],
              },
            },
            required: ['id', 'name', 'price', 'BasketItem'],
          },
        },
      },
      required: ['id', 'UserId', 'Products'],
    },
  },
  required: ['status', 'data'],
};
