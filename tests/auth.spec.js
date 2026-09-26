import { test, expect } from '@playwright/test';
import { DEMO_USER, login } from './helpers.js';

test.describe('Authentication & Route Protection', () => {
  test('unauthenticated users are redirected to /login', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login with valid demo credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', DEMO_USER.email);
    await page.fill('input[type="password"]', DEMO_USER.password);
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/\/login$/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText(DEMO_USER.name, { timeout: 30000 });
  });

  test('login with invalid password shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', DEMO_USER.email);
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).toContainText(/doesn’t match|یکسان نیست|خطا/i, { timeout: 30000 });
  });

  test('user sign-out redirects to /login cleanly', async ({ page }) => {
    await login(page);

    // Click user account menu in header
    await page.locator('header button[aria-haspopup="menu"]').last().click();
    await page.getByRole('menuitem', { name: /Sign out|خروج/i }).first().click();

    await expect(page).toHaveURL(/\/login$/, { timeout: 30000 });
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 30000 });
  });
});
