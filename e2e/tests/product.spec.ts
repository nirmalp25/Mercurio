import { expect, test } from '@playwright/test';
import { apiGet, type ApiProduct } from './helpers';

// AC4: clicking a product tile opens the product details page.
test.describe('Product details', () => {
  test('clicking a product tile opens /products/:id with title, price and description', async ({ page, request }) => {
    await page.goto('/');
    const tile = page.getByTestId('featured-product').first();
    await expect(tile).toBeVisible();
    const href = await tile.getAttribute('href');
    const id = Number(href?.match(/\/products\/(\d+)$/)?.[1]);
    expect(id).toBeGreaterThan(0);

    await tile.click();
    await expect(page).toHaveURL(new RegExp(`/products/${id}$`));

    const product = await apiGet<ApiProduct>(request, `/api/products/${id}`);
    const detail = page.getByTestId('product-detail');
    await expect(detail.getByRole('heading', { level: 1 })).toContainText(product.title.trim());
    await expect(detail.locator('.product-detail__price')).toContainText(String(Math.trunc(product.price)));
    await expect(detail.locator('.product-detail__description')).toHaveText(product.description.trim());
    await expect(detail.getByRole('button', { name: 'Enquire' })).toBeVisible();
  });

  test('an unknown product id shows an error instead of crashing', async ({ page }) => {
    await page.goto('/products/999999');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
