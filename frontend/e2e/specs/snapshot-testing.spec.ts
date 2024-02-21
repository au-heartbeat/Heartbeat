import { test } from '../fixtures/testWithExtendFixtures';
import { expect } from '@playwright/test';

test('Snapshot testing', async ({ page, homePage }) => {
  await homePage.goto();
  await homePage.importProjectFromFile();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('metrics-page.png', { fullPage: true });
});
