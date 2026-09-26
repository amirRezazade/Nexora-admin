import { test, expect } from '@playwright/test';
import { login, setLocale } from './helpers.js';

test.describe('Navigation & Admin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setLocale(page, 'fa');
  });

  const routes = [
    { path: '/', title: /داشبورد|Dashboard/i },
    { path: '/analytics', title: /تحلیل‌ها|Analytics/i },
    { path: '/products', title: /محصولات|Products/i },
    { path: '/categories', title: /دسته‌ها|Categories/i },
    { path: '/inventory', title: /انبار|Inventory/i },
    { path: '/orders', title: /سفارش‌ها|Orders/i },
    { path: '/customers', title: /مشتریان|Customers/i },
    { path: '/coupons', title: /کوپن‌ها|Coupons/i },
    { path: '/reviews', title: /نظرها|Reviews/i },
    { path: '/notifications', title: /اعلان‌ها|Notifications/i },
    { path: '/settings', title: /تنظیمات|Settings/i },
    { path: '/profile', title: /پروفایل|Profile/i },
    { path: '/support', title: /پشتیبانی|Support/i },
  ];

  for (const route of routes) {
    test(`loads ${route.path} page without errors`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(new RegExp(`${route.path}$`), { timeout: 30000 });
      await expect(page.locator('h1')).toHaveText(route.title, { timeout: 30000 });
    });
  }
});
