import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.TEST_URL || "http://localhost:3000";
const channel = process.env.PW_CHANNEL;

/**
 * Playwright E2E Test Configuration for Nexora Admin.
 *
 * Runs E2E tests against local server (http://localhost:3000) or Vercel URL.
 *
 * To run on Windows with local Chrome (no browser download required):
 *   PW_CHANNEL=chrome npx playwright test
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60 * 1000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 800 },
    navigationTimeout: 60 * 1000,
    actionTimeout: 30 * 1000,
  },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        ...(channel ? { channel } : {}),
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        ...(channel ? { channel } : {}),
        viewport: { width: 360, height: 667 },
      },
    },
  ],
});
