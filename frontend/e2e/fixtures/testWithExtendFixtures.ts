import { MetricsStep } from '../pages/metrics/MetricsStep';
import { ConfigStep } from '../pages/metrics/ConfigStep';
import { test as base } from '@playwright/test';
import { HomePage } from '../pages/Home';
export const test = base.extend({
  homePage: async ({ page }, use) => {
    const newPage = new HomePage(page);
    await use(newPage);
  },
  ConfigStep: async ({ page }, use) => {
    const newPage = new ConfigStep(page);
    await use(newPage);
  },
  MetricsStep: async ({ page }, use) => {
    const newPage = new MetricsStep(page);
    await use(newPage);
  },
});
