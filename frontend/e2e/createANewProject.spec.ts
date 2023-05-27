import { expect, test } from '@playwright/test'
import dayjs from 'dayjs'

import { HomePage } from './pages/Home'
import { MetricsConfigPage } from './pages/metrics/config'
import { viewportSize } from './fixtures'

test.use({
  viewport: viewportSize,
})

test('should create a project manually', async ({ page }) => {
  const homePage = new HomePage(page)

  await homePage.goto()
  await homePage.createANewProject()

  const metricsConfigPage = new MetricsConfigPage(page)

  await metricsConfigPage.typeProjectName('test Project Name')

  await expect(metricsConfigPage.collectionDate).toBeVisible()
  await expect(metricsConfigPage.regularCalendar).toBeChecked()
  await expect(metricsConfigPage.chinaCalendar).not.toBeChecked()

  await metricsConfigPage.selectRegularCalendar()

  const toDay = dayjs()
  const fromDay = toDay.subtract(14, 'day')

  await metricsConfigPage.selectDateRange(fromDay, toDay)

  await metricsConfigPage.selectVelocityAndClassificationInRequireData()
})
