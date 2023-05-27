import { expect, Locator, Page } from '@playwright/test'
import { Dayjs } from 'dayjs'
export class MetricsConfigPage {
  readonly page: Page
  readonly projectNameInput: Locator
  readonly RegularCalenderCheckbox: Locator
  readonly projectNameErrorMessage: Locator
  readonly collectionDate: Locator
  readonly regularCalendar: Locator
  readonly chinaCalendar: Locator
  readonly chooseDateButton: Locator
  readonly fromDateInput: Locator
  readonly fromDateInputButton: Locator
  readonly fromDateInputValueSelect: (fromDay: Dayjs) => Locator
  readonly toDateInput: Locator
  readonly toDateInputButton: Locator
  readonly toDateInputValueSelect: (toDay: Dayjs) => Locator
  readonly chooseDate: Locator
  readonly requireDataButton: Locator
  readonly velocityCheckbox: Locator
  readonly classificationCheckbox: Locator
  readonly requiredDataErrorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.projectNameInput = page.locator('label', { hasText: 'Project Name *' })
    this.projectNameErrorMessage = page.locator('Project Name is required')
    this.collectionDate = page.locator('h3', { hasText: 'Collection Date' })
    this.regularCalendar = page.locator("input[value='Regular Calendar(Weekend Considered)']")
    this.chinaCalendar = page.locator("input[value='Calendar with Chinese Holiday']")
    this.fromDateInput = page.locator('div').filter({ hasText: /^From \*$/ })
    this.fromDateInputButton = page
      .locator('div')
      .filter({ hasText: /^From \*$/ })
      .getByRole('button', { name: 'Choose date' })
    this.fromDateInputValueSelect = (fromDay: Dayjs) =>
      page.getByRole('dialog', { name: 'From *' }).getByRole('gridcell', { name: `${fromDay.date()}` })
    this.toDateInput = page.locator('div').filter({ hasText: /^To \*$/ })
    this.toDateInputButton = page
      .locator('div')
      .filter({ hasText: /^To \*$/ })
      .getByRole('button', { name: 'Choose date' })
    this.toDateInputValueSelect = (toDay: Dayjs) =>
      page.getByRole('dialog', { name: 'To *' }).getByRole('gridcell', { name: `${toDay.date()}` })

    this.requireDataButton = page.getByRole('button', { name: 'Required Data' })
    this.velocityCheckbox = page.getByRole('option', { name: 'Velocity' }).getByRole('checkbox')
    this.classificationCheckbox = page.getByRole('option', { name: 'Classification' }).getByRole('checkbox')
    this.requiredDataErrorMessage = page.locator('Metrics is required')
  }

  async typeProjectName(projectName = 'e2e test name') {
    await this.projectNameInput.type(projectName)
  }

  async selectRegularCalendar() {
    await this.regularCalendar.click()

    await expect(this.chinaCalendar).not.toBeChecked()
    await expect(this.regularCalendar).toBeChecked()
  }

  async selectDateRange(fromDay: Dayjs, toDay: Dayjs) {
    await this.fromDateInput.click()
    await this.fromDateInputButton.click()
    await this.fromDateInputValueSelect(fromDay).click()
    expect(this.page.getByText(covertToDateString(fromDay))).toBeTruthy()

    await this.toDateInputButton.click()
    await this.toDateInputValueSelect(toDay).click()
    expect(this.page.getByText(covertToDateString(toDay))).toBeTruthy()
  }

  async selectVelocityAndClassificationInRequireData() {
    await this.requireDataButton.click()
    await this.velocityCheckbox.check()
    await this.classificationCheckbox.check()
    await this.page.keyboard.press('Escape')

    await expect(this.requireDataButton).toHaveText('Velocity, Classification')

    await this.requireDataButton.click()
    await this.velocityCheckbox.uncheck()
    await this.classificationCheckbox.uncheck()
    await this.page.keyboard.press('Escape')

    expect(this.requiredDataErrorMessage).toBeTruthy()
  }
}
function covertToDateString(day: Dayjs): string | RegExp {
  return `${day.month() + 1} / ${day.date()} / ${day.year()}`
}
