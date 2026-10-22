/**
 * Page Object for the basket page.
 */
export class BasketPage {
  constructor(page) {
    this.page = page;
    this.basketLink = this.page.getByText('Your Basket', { exact: true });
  }

  async open() {
    await this.basketLink.click();
  }

  getProductRow(productName) {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  async removeProduct(productName) {
    const productRow = this.getProductRow(productName);

    await productRow.locator('mat-cell.mat-column-remove button').click();
  }
}
