import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 90000,
  reporter: [
    ['html', { outputFolder: 'tests/playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    browserName: 'chromium',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-390',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        // Chromium mobile emulation (iPhone 15 Pro 크기)
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-375',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  outputDir: 'tests/test-results',
})
