import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8088';

// Local demo credentials from .env.example (seeded admin). Never real credentials.
export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@mercurio.test',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'password',
};

export interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: { name: string; slug: string };
  isTopRated: boolean;
}

/** Reads JSON `data` from the API directly — used only to cross-check what the UI shows. */
export async function apiGet<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(`${API_URL}${path}`, { headers: { Accept: 'application/json' } });
  expect(response.ok(), `GET ${path} -> ${response.status()}`).toBeTruthy();
  return ((await response.json()) as { data: T }).data;
}

/** Every product in the catalogue, gathered category by category. */
export async function allProducts(request: APIRequestContext): Promise<ApiProduct[]> {
  const categories = await apiGet<{ slug: string }[]>(request, '/api/categories');
  const lists = await Promise.all(
    categories.map((c) =>
      apiGet<{ products: ApiProduct[] }>(request, `/api/categories/${c.slug}/products`).then((d) => d.products),
    ),
  );
  return lists.flat();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  const form = page.getByTestId('login-form');
  await form.getByLabel('Email').fill(ADMIN.email);
  await form.getByLabel('Password').fill(ADMIN.password);
  await form.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin\/queries$/);
  await expect(page.getByRole('heading', { name: 'Customer queries' })).toBeVisible();
}
