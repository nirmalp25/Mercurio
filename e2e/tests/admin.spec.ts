import { expect, test } from '@playwright/test';
import { ADMIN, loginAsAdmin } from './helpers';

test.describe('Admin access', () => {
  test('visiting /admin/queries while signed out redirects to the login page', async ({ page }) => {
    await page.goto('/admin/queries');
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
  });

  test('wrong password shows an error and stays on the login page', async ({ page }) => {
    await page.goto('/admin/login');
    const form = page.getByTestId('login-form');
    await form.getByLabel('Email').fill(ADMIN.email);
    await form.getByLabel('Password').fill('definitely-wrong-password');
    await form.getByRole('button', { name: 'Sign in' }).click();
    await expect(form.getByRole('alert').first()).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test('admin can sign in and reach the Queries page, then sign out', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto('/admin/queries');
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
