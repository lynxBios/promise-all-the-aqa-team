import { expect } from '@playwright/test';
import { test } from '../fixtures/authenticatedPage.js';
import { TEST_USER } from '../config/testData.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { BasketPage } from '../pages/BasketPage.js';

const APPLE_JUICE = 'Apple Juice';
const APPLE_JUICE_IN_BASKET = 'Apple Juice (1000ml)';
const APPLE_JUICE_PRICE = '1.99¤';

test('user can add Apple Juice to basket', async ({ authenticatedPage }) => {
  const productsPage = new ProductsPage(authenticatedPage);

  const basketCountBefore = await authenticatedPage
    .locator('.fa-layers-counter')
    .innerText();

  await productsPage.addProductToBasket(APPLE_JUICE);

  await expect(authenticatedPage.locator('.fa-layers-counter')).not.toHaveText(
    basketCountBefore,
  );
});

test('Apple Juice displays correct information', async ({
  authenticatedPage,
}) => {
  const productsPage = new ProductsPage(authenticatedPage);
  const product = productsPage.findProduct(APPLE_JUICE);

  await expect(product).toContainText(APPLE_JUICE_IN_BASKET);
  await expect(product).toContainText(APPLE_JUICE_PRICE);
});

test('user can open basket', async ({ authenticatedPage }) => {
  const basketPage = new BasketPage(authenticatedPage);

  await basketPage.open();

  await expect(
    authenticatedPage.getByText(`Your Basket (${TEST_USER.email})`),
  ).toBeVisible();
});

test('added product is displayed in basket', async ({ authenticatedPage }) => {
  const productsPage = new ProductsPage(authenticatedPage);
  const basketPage = new BasketPage(authenticatedPage);

  await productsPage.addProductToBasket(APPLE_JUICE);
  await basketPage.open();

  await expect(basketPage.getProductRow(APPLE_JUICE_IN_BASKET)).toBeVisible();
});

test('user can remove product from basket', async ({ authenticatedPage }) => {
  const productsPage = new ProductsPage(authenticatedPage);
  const basketPage = new BasketPage(authenticatedPage);

  await productsPage.addProductToBasket(APPLE_JUICE);
  await basketPage.open();

  await expect(basketPage.getProductRow(APPLE_JUICE_IN_BASKET)).toBeVisible();

  await basketPage.removeProduct(APPLE_JUICE_IN_BASKET);

  await expect(
    basketPage.getProductRow(APPLE_JUICE_IN_BASKET),
  ).not.toBeVisible();
});
