import { expect, test } from '@playwright/test';
import { apiGet, type ApiProduct } from './helpers';

// AC1: the home page shows the 5 products the admin has chosen as top rated.
test.describe('Home page', () => {
  test('shows exactly the 5 admin-chosen top rated products', async ({ page, request }) => {
    const expected = await apiGet<ApiProduct[]>(request, '/api/products/top-rated');
    expect(expected, 'seed data should feature 5 products').toHaveLength(5);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Top rated' })).toBeVisible();

    const featured = page.getByTestId('featured-product');
    await expect(featured).toHaveCount(5);

    const shownTitles = await featured.locator('h3').allTextContents();
    expect(shownTitles.map((t) => t.trim()).sort()).toEqual(expected.map((p) => p.title.trim()).sort());
  });

  test('lists the categories', async ({ page, request }) => {
    const categories = await apiGet<{ name: string }[]>(request, '/api/categories');
    await page.goto('/');
    await expect(page.getByTestId('category-card')).toHaveCount(categories.length);
  });
});
