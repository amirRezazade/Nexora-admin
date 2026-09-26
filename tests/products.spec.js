import { test, expect } from '@playwright/test';
import { login, setLocale } from './helpers.js';

test.describe('Products & Pricing Formatting', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setLocale(page, 'fa');
  });

  test('pricing card formats whole dollar amounts without trailing .00 decimals in Persian', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table tbody tr', { timeout: 30000 });

    // Go to first product detail page
    const link = page.locator('table tbody tr a').first();
    await link.click();

    await page.waitForSelector('text=قیمت‌گذاری', { timeout: 30000 });

    // Get pricing card text
    const pricingText = await page.locator('.card', { hasText: 'قیمت‌گذاری' }).innerText();

    // Integer dollar prices should be formatted as $۵۸ or $۶۹, NOT $۵۸٫۰۰ or $۶۹٫۰۰
    expect(pricingText).not.toMatch(/٫۰۰/);
  });

  test('can create a new product with optional fields left blank', async ({ page }) => {
    await page.goto('/products/new', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('form', { timeout: 30000 });

    const testSku = `E2E-${Date.now().toString().slice(-4)}`;

    await page.locator('input[placeholder="e.g. Merino Wool Crew Sweater"]').fill('Playwright E2E Product');
    await page.locator('input[placeholder="AP-MER-022"]').fill(testSku);

    // Select category
    const catSelect = page.locator('select').first();
    await catSelect.selectOption({ index: 1 });

    // Price input
    const priceInput = page.locator('input[placeholder="0.00"]').first();
    await priceInput.fill('49.00', { force: true });

    // Submit
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.click({ force: true });

    // Should redirect to product list or detail page without validation error
    await expect(page.locator('body')).not.toContainText(/invalid input syntax for type numeric/i, { timeout: 30000 });
  });
});
