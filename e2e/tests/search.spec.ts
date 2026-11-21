import { expect, test } from '@playwright/test';
import { allProducts, type ApiProduct } from './helpers';

const TERM = 'shirt';

function matches(product: ApiProduct, term: string): boolean {
  const t = term.toLowerCase();
  return [product.title, product.description, product.category.name].some((field) => field.toLowerCase().includes(t));
}

// AC3: debounced autocomplete while typing; clicking Search shows only products whose text matches.
test.describe('Search', () => {
  test('typing shows autocomplete suggestions matching the term', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('combobox', { name: 'Search products' });
    await input.pressSequentially(TERM, { delay: 40 });

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const options = listbox.getByRole('option');
    await expect(options.first()).toBeVisible();
    for (const text of await options.locator('span').allTextContents()) {
      expect(text.toLowerCase()).toContain(TERM);
    }
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  test('suggestions are debounced (no request per keystroke)', async ({ page }) => {
    const suggestCalls: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/api/products/suggest')) suggestCalls.push(r.url());
    });
    await page.goto('/');
    await page.getByRole('combobox', { name: 'Search products' }).pressSequentially('jacket', { delay: 30 });
    await expect(page.getByRole('listbox')).toBeVisible();
    // 6 quick keystrokes (30ms apart, debounce 300ms) should produce a single request for the final term.
    expect(suggestCalls.length).toBeLessThanOrEqual(2);
    expect(suggestCalls.at(-1)).toContain('q=jacket');
  });

  test('clicking a suggestion opens that product', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('combobox', { name: 'Search products' }).pressSequentially(TERM, { delay: 40 });
    const option = page.getByRole('option').first();
    const title = (await option.locator('span').textContent())!.trim();
    await option.click();
    await expect(page).toHaveURL(/\/products\/\d+$/);
    await expect(page.getByTestId('product-detail').getByRole('heading', { level: 1 })).toContainText(title);
  });

  test('clicking Search shows only products whose text matches the term', async ({ page, request }) => {
    const expected = (await allProducts(request)).filter((p) => matches(p, TERM));
    expect(expected.length, 'test term should match something in the seed data').toBeGreaterThan(0);

    await page.goto('/');
    await page.getByRole('combobox', { name: 'Search products' }).fill(TERM);
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`/search\\?q=${TERM}$`));
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`Results for “${TERM}”`);

    const results = page.getByTestId('search-result');
    await expect(results).toHaveCount(expected.length);
    const titles = (await results.locator('h3').allTextContents()).map((t) => t.trim());
    expect([...titles].sort()).toEqual(expected.map((p) => p.title.trim()).sort());

    // Every shown result really matches in title, description or category (case-insensitive).
    const byTitle = new Map(expected.map((p) => [p.title.trim(), p]));
    for (const title of titles) expect(matches(byTitle.get(title)!, TERM), title).toBe(true);
  });

  test('a nonsense term shows the empty state', async ({ page }) => {
    const term = `zzqxnomatch${Date.now()}`;
    await page.goto('/');
    await page.getByRole('combobox', { name: 'Search products' }).fill(term);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText(`No products match “${term}”.`)).toBeVisible();
    await expect(page.getByTestId('search-result')).toHaveCount(0);
  });
});
