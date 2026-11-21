import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { apiGet, loginAsAdmin, type ApiProduct } from './helpers';

// AC5: Enquire -> modal form -> submit -> stored with a date -> "Thank you" SweetAlert -> visible to the admin.
// The enquiry endpoint is throttled (5/min per IP), so this file submits exactly one valid enquiry per run.

async function openEnquiryForFirstFeatured(page: Page, request: APIRequestContext) {
  const [product] = await apiGet<ApiProduct[]>(request, '/api/products/top-rated');
  await page.goto(`/products/${product.id}`);
  await page.getByRole('button', { name: 'Enquire' }).click();
  const dialog = page.getByRole('dialog', { name: /Enquire about this product/ });
  await expect(dialog).toBeVisible();
  return { product, dialog, form: dialog.getByTestId('enquiry-form') };
}

test.describe('Enquiry', () => {
  test('submitting empty shows field errors and sends no request', async ({ page, request }) => {
    const posts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/api/enquiries')) posts.push(r.url());
    });

    const { form } = await openEnquiryForFirstFeatured(page, request);
    await form.getByRole('button', { name: 'Send enquiry' }).click();

    for (const label of ['First name', 'Last name', 'Email', 'Contact number', 'Your query']) {
      await expect(form.getByLabel(label), `${label} should be marked invalid`).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(form.locator('.field__error')).toHaveCount(5);
    expect(posts).toHaveLength(0);
  });

  test('valid enquiry shows "Thank you" and appears on the admin Queries page', async ({ page, request }) => {
    const unique = `E2E enquiry ${Date.now()}-${Math.random().toString(36).slice(2, 8)}: is this in stock?`;
    const { product, dialog, form } = await openEnquiryForFirstFeatured(page, request);

    await form.getByLabel('First name').fill('Playwright');
    await form.getByLabel('Last name').fill('Tester');
    await form.getByLabel('Email').fill('e2e.tester@example.com');
    await form.getByLabel('Country code').selectOption('US');
    await form.getByLabel('Contact number').fill('2015550123');
    await form.getByLabel('Your query').fill(unique);

    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/enquiries'),
    );
    await form.getByRole('button', { name: 'Send enquiry' }).click();
    const response = await responsePromise;
    expect(response.status(), await response.text()).toBe(201);

    await expect(page.getByRole('heading', { name: /Thank you/ })).toBeVisible();
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Close' }).click();

    // The admin sees it (newest first) with product, customer, contact and received date.
    await loginAsAdmin(page);
    const row = page.getByTestId('admin-enquiry-row').filter({ hasText: unique });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(product.title.trim());
    await expect(row).toContainText('Playwright Tester');
    await expect(row).toContainText('e2e.tester@example.com');
    await expect(row).toContainText('+1');
    await expect(row.locator('td').first()).not.toBeEmpty();
  });
});
