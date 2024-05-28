import { chromium } from '@playwright/test';

export default async function adjustBrowserTimezone() {
  const browser = await chromium.launch();
  await browser.newContext({
    timezoneId: 'Asia/Shanghai', // 设置所需的时区
  });
}
