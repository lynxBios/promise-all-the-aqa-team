/**
 * Dismisses application welcome and cookie banners.
 */
export async function applicationSetup(page) {
  await page
    .getByRole('button', {
      name: 'Close Welcome Banner',
    })
    .click();

  await page
    .getByRole('button', {
      name: 'dismiss cookie message',
    })
    .click();
}
