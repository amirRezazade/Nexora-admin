import { test, expect } from '@playwright/test';
import { login, setLocale, assertNoHorizontalScroll } from './helpers.js';

test.describe('Mobile Responsiveness & Layout', () => {
  test.use({ viewport: { width: 360, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
    await setLocale(page, 'fa');
  });

  test('/categories table fits within mobile screen without document scroll', async ({ page }) => {
    await page.goto('/categories', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table tbody tr', { timeout: 30000 });

    const scroll = await assertNoHorizontalScroll(page);
    expect(scroll.hasOverflow).toBe(false);
  });

  test('/reviews page fits within mobile screen', async ({ page }) => {
    await page.goto('/reviews', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table tbody tr', { timeout: 30000 });

    const scroll = await assertNoHorizontalScroll(page);
    expect(scroll.hasOverflow).toBe(false);
  });

  test('/coupons page fits within mobile screen', async ({ page }) => {
    await page.goto('/coupons', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table tbody tr', { timeout: 30000 });

    const scroll = await assertNoHorizontalScroll(page);
    expect(scroll.hasOverflow).toBe(false);
  });

  test('Add Category modal stays within viewport height and is scrollable', async ({ page }) => {
    await page.goto('/categories', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table tbody tr', { timeout: 30000 });
    await page.getByRole('button', { name: /افزودن دسته|Add Category/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 30000 });

    const box = await dialog.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.height).toBeLessThanOrEqual(667);
  });
});
