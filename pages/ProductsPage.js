/**
 * Page Object for the products page.
 */
export class ProductsPage {
  constructor(page) {
    this.page = page;
  }

  findProduct(productName) {
    return this.page.locator('mat-card').filter({ hasText: productName });
  }

  async addProductToBasket(productName) {
    const product = this.findProduct(productName);

    await product
      .getByRole('button', {
        name: 'Add to Basket',
      })
      .click();
  }
}
