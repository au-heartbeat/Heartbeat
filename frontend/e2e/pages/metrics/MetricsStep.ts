import { expect, Locator, Page } from '@playwright/test';

export class MetricsStep {
  readonly page: Page;
  readonly metricsStepTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.metricsStepTitle = page.getByText('Metrics');
  }

  async waitForStep() {
    await expect(this.metricsStepTitle).toHaveClass('Mui-active');
  }
}
