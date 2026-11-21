import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiGet } from './helpers';

interface CategoryProducts {
  category: { name: string; slug: string };
  topRated: { id: number; title: string }[];
  products: { id: number; title: string; isTopRated: boolean }[];
}

const PREVIEW_COUNT = 4; // homeConfig.categoryModal.topRatedPreviewCount

/** First category whose data satisfies `predicate`, with its products. */
async function findCategory(request: APIRequestContext, predicate: (d: CategoryProducts) => boolean) {
  const categories = await apiGet<{ slug: string; name: string }[]>(request, '/api/categories');
  for (const c of categories) {
    const data = await apiGet<CategoryProducts>(request, `/api/categories/${c.slug}/products`);
    if (predicate(data)) return { name: c.name, data };
  }
  return undefined;
}

// AC2: a category card opens a near-fullscreen modal with a top rated section and all products (top rated badged).
test.describe('Category modal', () => {
  test('shows top rated and all products, badges top rated ones, closes on Esc', async ({ page, request }) => {
    // Pick a category with at least one top rated product so the badge assertions are meaningful.
    const found = await findCategory(request, (d) => d.topRated.length > 0);
    test.skip(!found, 'no category has a top rated product in the current data');
    const { name, data } = found!;

    await page.goto('/');
    await page.getByTestId('category-card').filter({ hasText: name }).click();

    const modal = page.getByRole('dialog', { name });
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('data-testid', 'category-modal');

    // Near-fullscreen: the dialog covers most of the viewport.
    const viewport = page.viewportSize()!;
    const box = (await modal.boundingBox())!;
    expect(box.width).toBeGreaterThan(viewport.width * 0.8);
    expect(box.height).toBeGreaterThan(viewport.height * 0.8);

    // Section 1: top rated (preview shows up to PREVIEW_COUNT, then "Show more").
    const topSection = modal.getByTestId('category-top-rated');
    await expect(topSection.getByRole('heading', { name: 'Top rated' })).toBeVisible();
    await expect(topSection.getByTestId('category-top-rated-product')).toHaveCount(
      Math.min(data.topRated.length, PREVIEW_COUNT),
    );

    // Section 2: every product in the category.
    const allSection = modal.getByTestId('category-all');
    await expect(allSection.getByRole('heading', { name: /All products in/ })).toBeVisible();
    const tiles = allSection.getByTestId('category-product');
    await expect(tiles).toHaveCount(data.products.length);

    // The star badge appears exactly on the top rated tiles.
    for (const product of data.products) {
      const tile = tiles.filter({ has: page.locator('h3', { hasText: product.title.trim() }) }).first();
      const badge = tile.getByRole('img', { name: 'Top rated' });
      if (product.isTopRated) await expect(badge, `${product.title} should be badged`).toBeVisible();
      else await expect(badge, `${product.title} should not be badged`).toHaveCount(0);
    }

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('"Show more" reveals the remaining top rated products', async ({ page, request }) => {
    const found = await findCategory(request, (d) => d.topRated.length > PREVIEW_COUNT);
    test.skip(!found, `no category has more than ${PREVIEW_COUNT} top rated products in the current data`);
    const { name, data } = found!;

    await page.goto('/');
    await page.getByTestId('category-card').filter({ hasText: name }).click();
    const top = page.getByTestId('category-top-rated');
    await expect(top.getByTestId('category-top-rated-product')).toHaveCount(PREVIEW_COUNT);
    await top.getByRole('button', { name: /Show more/ }).click();
    await expect(top.getByTestId('category-top-rated-product')).toHaveCount(data.topRated.length);
  });

  test('the close button also closes the modal', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('category-card').first().click();
    const modal = page.getByTestId('category-modal');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();
  });
});
