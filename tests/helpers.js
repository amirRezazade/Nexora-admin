/**
 * Common test helper functions for Nexora Admin E2E tests.
 */

export const DEMO_USER = {
  email: 'amir.rezazadeh@nexora.com',
  password: 'nexora2026',
  name: 'Amir Rezazadeh',
};

/**
 * Perform a full browser login with valid demo credentials.
 */
export async function login(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', DEMO_USER.email);
  await page.fill('input[type="password"]', DEMO_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.href.endsWith('/login'), { timeout: 30000 });
}

/**
 * Set the app locale (fa or en) in localStorage and reload.
 */
export async function setLocale(page, locale = 'fa') {
  await page.evaluate((loc) => localStorage.setItem('nexora-locale', loc), locale);
}

/**
 * Assert that the document does not have unwanted horizontal scrollbar.
 */
export async function assertNoHorizontalScroll(page) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      hasOverflow: doc.scrollWidth > doc.clientWidth,
    };
  });
  return result;
}
