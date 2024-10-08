import { config as configStepData } from '../../fixtures/create-new/config-step';
import { METRICS_STEP_SAVING_FILENAME } from '../../fixtures';
import { downloadFileAndCheck } from '../../utils/download';
import { expect, Locator, Page } from '@playwright/test';
import { format } from '../../utils/date-time';
import { Dayjs } from 'dayjs';

interface IBoardData {
  type: string;
  boardId: string;
  email: string;
  site: string;
  token: string | undefined;
}

interface IPipelineToolData {
  token: string;
}

interface ISourceControlData {
  token: string;
}

enum CalendarType {
  REGULAR = 'REGULAR',
  CN = 'CN',
  VN = 'VN',
}

export class ConfigStep {
  readonly page: Page;
  readonly stepTitle: Locator;
  readonly projectNameInput: Locator;
  readonly regularCalendar: Locator;
  readonly chineseCalendar: Locator;
  readonly vietnamCalendar: Locator;
  readonly basicInfoContainer: Locator;
  readonly newTimeRangeButton: Locator;
  readonly removeTimeRangeButtons: Locator;
  readonly timeRangeRows: Locator;
  readonly fromDateErrorMessage: Locator;
  readonly toDateErrorMessage: Locator;
  readonly fromDateInput: Locator;
  readonly fromDateInputButton: Locator;
  readonly fromDateInputValueSelect: (fromDay: Dayjs) => Locator;
  readonly toDateInput: Locator;
  readonly toDateInputButton: Locator;
  readonly toDateInputValueSelect: (toDay: Dayjs) => Locator;
  readonly requireDataButton: Locator;
  readonly velocityCheckbox: Locator;
  readonly cycleTimeCheckbox: Locator;
  readonly classificationCheckbox: Locator;
  readonly requiredDataErrorMessage: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly previousModal: Locator;
  readonly previousModalYesButton: Locator;
  readonly previousModalCancelButton: Locator;
  readonly requiredMetricsLabel: Locator;
  readonly requiredMetricsAllOption: Locator;
  readonly requiredMetricsVelocityOption: Locator;
  readonly requiredMetricsCycleTimeOption: Locator;
  readonly requiredMetricsClassificationOption: Locator;
  readonly requiredMetricsLeadTimeForChangesOption: Locator;
  readonly requiredMetricsDeploymentFrequencyOption: Locator;
  readonly requiredMetricsChangeFailureRateOption: Locator;
  readonly requiredMetricsMeanTimeToRecoveryOption: Locator;
  readonly requiredMetricsReworkTimesOption: Locator;
  readonly boardContainer: Locator;
  readonly boardTypeSelect: Locator;
  readonly boardIdInput: Locator;
  readonly boardEmailInput: Locator;
  readonly boardSiteInput: Locator;
  readonly boardTokenInput: Locator;
  readonly boardVerifyButton: Locator;
  readonly boardVerifiedButton: Locator;
  readonly boardResetButton: Locator;
  readonly resetConfirmDialog: Locator;
  readonly resetConfirmDialogClose: Locator;
  readonly resetConfirmDialogContent: Locator;
  readonly resetConfirmDialogCancelButton: Locator;
  readonly resetConfirmDialogConfirmButton: Locator;
  readonly boardTokenErrorMessage: Locator;
  readonly boardVerifyFailedPopupMessage: Locator;
  readonly pipelineToolContainer: Locator;
  readonly pipelineToolTypeSelect: Locator;
  readonly pipelineToolTypeBuildKiteOption: Locator;
  readonly pipelineToolTypeOtherOption: Locator;
  readonly pipelineToolTokenInput: Locator;
  readonly pipelineToolVerifyButton: Locator;
  readonly pipelineToolVerifiedButton: Locator;
  readonly pipelineToolResetButton: Locator;
  readonly pipelineTokenErrorMessage: Locator;
  readonly sourceControlContainer: Locator;
  readonly sourceControlTypeSelect: Locator;
  readonly sourceControlTokenInput: Locator;
  readonly sourceControlVerifyButton: Locator;
  readonly sourceControlVerifiedButton: Locator;
  readonly sourceControlResetButton: Locator;
  readonly sourceControlTokenErrorMessage: Locator;
  readonly saveAsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stepTitle = page.getByText('Config');
    this.projectNameInput = page.getByLabel('Project name *');
    this.regularCalendar = page.getByText('Regular calendar');
    this.chineseCalendar = page.getByText('Calendar with Chinese holiday');
    this.vietnamCalendar = page.getByText('Calendar with Vietnam holiday');
    this.basicInfoContainer = page.getByLabel('Basic information');
    this.fromDateInput = this.basicInfoContainer.getByRole('textbox', { name: 'From' });
    this.fromDateInputButton = page
      .locator('div')
      .filter({ hasText: /^From \*$/ })
      .getByRole('button', { name: 'Choose date' });
    this.fromDateInputValueSelect = (fromDay: Dayjs) =>
      page.getByRole('dialog', { name: 'From *' }).getByRole('gridcell', { name: `${fromDay.date()}` });
    this.toDateInput = this.basicInfoContainer.getByRole('textbox', { name: 'To' });
    this.toDateInputButton = page
      .locator('div')
      .filter({ hasText: /^To \*$/ })
      .getByRole('button', { name: 'Choose date' });
    this.toDateInputValueSelect = (toDay: Dayjs) =>
      page.getByRole('dialog', { name: 'To *' }).getByRole('gridcell', { name: `${toDay.date()}` });
    this.newTimeRangeButton = this.basicInfoContainer.getByRole('button', { name: 'Button for adding date range' });
    this.timeRangeRows = this.basicInfoContainer.getByLabel('Range picker row');
    this.fromDateErrorMessage = this.basicInfoContainer.getByText('Start date is invalid');
    this.toDateErrorMessage = this.basicInfoContainer.getByText('End date is invalid');
    this.removeTimeRangeButtons = this.basicInfoContainer.getByText('Remove');

    this.requireDataButton = page.getByRole('button', { name: 'Required Data' });
    this.velocityCheckbox = page.getByRole('option', { name: 'Velocity' }).getByRole('checkbox');
    this.cycleTimeCheckbox = page.getByRole('option', { name: 'Cycle Time' }).getByRole('checkbox');
    this.classificationCheckbox = page.getByRole('option', { name: 'Classification' }).getByRole('checkbox');
    this.requiredDataErrorMessage = page.getByText('Metrics is required');
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.previousModal = page.getByText('All the filled data will be cleared. Continue to Home page?');
    this.previousModalYesButton = page.getByLabel('return to home page confirm dialog confirm button');
    this.previousModalCancelButton = page.getByLabel('return to home page confirm dialog cancel button');

    this.requiredMetricsLabel = page.getByLabel('Required metrics *');
    this.requiredMetricsAllOption = page.getByRole('option', { name: 'All' });
    this.requiredMetricsVelocityOption = page.getByRole('option', { name: 'Velocity' });
    this.requiredMetricsCycleTimeOption = page.getByRole('option', { name: 'Cycle time' });
    this.requiredMetricsClassificationOption = page.getByRole('option', { name: 'Classification' });
    this.requiredMetricsReworkTimesOption = page.getByRole('option', { name: 'Rework times' });
    this.requiredMetricsLeadTimeForChangesOption = page.getByRole('option', { name: 'Lead time for changes' });
    this.requiredMetricsDeploymentFrequencyOption = page.getByRole('option', { name: 'Deployment frequency' });
    this.requiredMetricsChangeFailureRateOption = page.getByRole('option', { name: 'Change failure rate' });
    this.requiredMetricsMeanTimeToRecoveryOption = page.getByRole('option', { name: 'Mean time to recovery' });
    this.requiredMetricsReworkTimesOption = page.getByRole('option', { name: 'Rework times' });

    this.boardContainer = page.getByLabel('Board Config');
    this.boardTypeSelect = this.boardContainer.getByLabel('Board *');
    this.boardIdInput = this.boardContainer.getByLabel('Board Id *');
    this.boardEmailInput = this.boardContainer.getByLabel('Email *');
    this.boardSiteInput = this.boardContainer.getByLabel('Site *');
    this.boardTokenInput = this.boardContainer.getByLabel('Token *');
    this.boardVerifyButton = this.boardContainer.getByRole('button', { name: 'Verify' });
    this.boardVerifiedButton = this.boardContainer.getByRole('button', { name: 'Verified' });
    this.boardResetButton = this.boardContainer.getByRole('button', { name: 'Reset' });
    this.resetConfirmDialog = this.page.getByLabel('reset confirm dialog').first();
    this.resetConfirmDialogClose = this.page.getByLabel('reset confirm dialog close');
    this.resetConfirmDialogContent = this.page.getByLabel('reset confirm dialog content');
    this.resetConfirmDialogCancelButton = this.page.getByLabel('reset confirm dialog cancel button');
    this.resetConfirmDialogConfirmButton = this.page.getByLabel('reset confirm dialog confirm button');
    this.boardTokenErrorMessage = this.boardContainer.getByText(
      'Token is invalid, please change your token with correct access permission!',
    );
    this.boardVerifyFailedPopupMessage = this.boardContainer.getByText(
      'Email and Token are bound for verification. Please modify one of the Email or Token before verify!',
    );

    this.pipelineToolContainer = page.getByLabel('Pipeline Tool Config');
    this.pipelineToolTypeSelect = this.pipelineToolContainer.getByLabel('Pipeline Tool *');
    this.pipelineToolTypeBuildKiteOption = page.getByRole('option', { name: 'BuildKite' });
    this.pipelineToolTypeOtherOption = page.getByRole('option', { name: 'Other' });
    this.pipelineToolTokenInput = this.pipelineToolContainer.getByLabel('Token');
    this.pipelineToolVerifyButton = this.pipelineToolContainer.getByRole('button', { name: 'Verify' });
    this.pipelineToolVerifiedButton = this.pipelineToolContainer.getByRole('button', { name: 'Verified' });
    this.pipelineToolResetButton = this.pipelineToolContainer.getByRole('button', { name: 'Reset' });
    this.pipelineTokenErrorMessage = this.pipelineToolContainer.getByText('Token is incorrect!');

    this.sourceControlContainer = page.getByLabel('Source Control Config');
    this.sourceControlTypeSelect = this.sourceControlContainer.getByLabel('Source Control *');
    this.sourceControlTokenInput = this.sourceControlContainer.getByLabel('Token');
    this.sourceControlVerifyButton = this.sourceControlContainer.getByRole('button', { name: 'Verify' });
    this.sourceControlVerifiedButton = this.sourceControlContainer.getByRole('button', { name: 'Verified' });
    this.sourceControlResetButton = this.sourceControlContainer.getByRole('button', { name: 'Reset' });
    this.sourceControlTokenErrorMessage = this.sourceControlContainer.getByText('Token is incorrect!');

    this.saveAsButton = page.getByRole('button', { name: 'Save' });
  }

  async waitForShown() {
    await expect(this.stepTitle).toHaveClass(/Mui-active/);
  }

  async checkRemindImportedDataNotMatched() {
    await expect(this.page.getByRole('alert').first()).toContainText(
      'Imported data is not perfectly matched. Please review carefully before going next!',
    );
  }

  async checkProjectName(projectName: string) {
    await expect(this.projectNameInput).toHaveValue(projectName);
  }

  async typeInProjectName(projectName: string) {
    await this.projectNameInput.fill(projectName);
  }

  async clickPreviousButtonThenGoHome() {
    await this.previousButton.click();

    await expect(this.previousModal).toBeVisible();

    await this.previousModalYesButton.click();

    await expect(this.page).toHaveURL(/\//);
  }

  async clickPreviousButtonAndClickCancelThenRemainPage() {
    await this.previousButton.click();

    await expect(this.previousModal).toBeVisible();

    await this.previousModalCancelButton.click();

    await expect(this.page).toHaveURL(/\/metrics/);
  }

  async selectRegularCalendar(calendarType: string) {
    if (calendarType === CalendarType.CN) {
      await this.chineseCalendar.click();
      await expect(this.chineseCalendar).toBeChecked();
      await expect(this.vietnamCalendar).not.toBeChecked();
      await expect(this.regularCalendar).not.toBeChecked();
    } else if (calendarType === CalendarType.VN) {
      await this.vietnamCalendar.click();
      await expect(this.vietnamCalendar).toBeChecked();
      await expect(this.chineseCalendar).not.toBeChecked();
      await expect(this.regularCalendar).not.toBeChecked();
    } else {
      await this.regularCalendar.click();
      await expect(this.regularCalendar).toBeChecked();
      await expect(this.chineseCalendar).not.toBeChecked();
      await expect(this.vietnamCalendar).not.toBeChecked();
    }
  }

  async selectDateRange(fromDay: Dayjs, toDay: Dayjs) {
    await this.fromDateInput.click();
    await this.fromDateInputButton.click();
    await this.fromDateInputValueSelect(fromDay).click();
    expect(this.page.getByText(covertToDateString(fromDay))).toBeTruthy();

    await this.toDateInputButton.click();
    await this.toDateInputValueSelect(toDay).click();
    expect(this.page.getByText(covertToDateString(toDay))).toBeTruthy();
  }

  async typeInDateRange({ startDate, endDate, number = 0 }: { startDate: string; endDate: string; number?: number }) {
    await this.fromDateInput.nth(number).fill(startDate);
    await this.toDateInput.nth(number).fill(endDate);
  }

  async typeInMultipleRanges(ranges: { startDate: string; endDate: string }[]) {
    await this.addNewTimeRangeAndVerify(ranges.length);
    await this.typeInMultipleRangesAndVerify(ranges);
  }

  async typeInMultipleRangesAndVerify(ranges: { startDate: string; endDate: string }[]) {
    for (let i = 0; i < ranges.length; i++) {
      const dateRange = {
        startDate: format(ranges[i].startDate),
        endDate: format(ranges[i].endDate),
      };
      await this.typeInDateRange({ ...dateRange, number: i });
      await expect(this.fromDateInput.nth(i)).toHaveValue(dateRange.startDate);
      await expect(this.toDateInput.nth(i)).toHaveValue(dateRange.endDate);
    }
  }

  async addNewTimeRangeAndVerify(length: number) {
    for (let i = 1; i < length; i++) {
      await this.addNewTimeRange();
    }
    await expect(this.timeRangeRows).toHaveCount(length);
  }

  async validateNextButtonNotClickable() {
    await expect(this.nextButton).toBeDisabled();
  }

  async validateAddNewTimeRangeButtonNotClickable() {
    await expect(this.newTimeRangeButton).toBeDisabled();
  }

  async validateRemoveTimeRangeButtonIsHidden() {
    await expect(this.removeTimeRangeButtons.last()).toBeHidden();
  }

  async checkErrorStratTimeMessage() {
    await expect(this.fromDateErrorMessage).toBeVisible();
  }

  async checkErrorEndTimeMessage() {
    await expect(this.toDateErrorMessage).toBeVisible();
  }

  async validateNextButtonClickable() {
    await expect(this.nextButton).toBeEnabled();
  }

  async selectAllRequiredMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsAllOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectBoardMetricsOnly() {
    await this.requiredMetricsLabel.first().click();
    await this.velocityCheckbox.click();
    await this.classificationCheckbox.click();
    await this.cycleTimeCheckbox.click();
    await this.page.keyboard.press('Escape');
  }

  async selectVelocityRequiredMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsVelocityOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectCycleTimeRequiredMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsCycleTimeOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectClassificationRequiredMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsClassificationOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectReworkTimesRequiredMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsReworkTimesOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectLeadTimeForChangesMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsLeadTimeForChangesOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectDeploymentFrequencyMetrics() {
    await this.requiredMetricsLabel.first().click();
    await this.requiredMetricsDeploymentFrequencyOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectChangeFailureRateMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsChangeFailureRateOption.click();
    await this.page.keyboard.press('Escape');
  }

  async selectMeanTimeToRecoveryMetrics() {
    await this.requiredMetricsLabel.click();
    await this.requiredMetricsMeanTimeToRecoveryOption.click();
    await this.page.keyboard.press('Escape');
  }

  async checkBoardFormVisible() {
    await expect(this.boardContainer).toBeVisible();
    await expect(this.boardTypeSelect).toBeVisible();
    await expect(this.boardIdInput).toBeVisible();
    await expect(this.boardEmailInput).toBeVisible();
    await expect(this.boardSiteInput).toBeVisible();
    await expect(this.boardTokenInput).toBeVisible();
  }

  async checkBoardFormInvisible() {
    await expect(this.boardContainer).toBeHidden();
    await expect(this.boardTypeSelect).toBeHidden();
    await expect(this.boardIdInput).toBeHidden();
    await expect(this.boardEmailInput).toBeHidden();
    await expect(this.boardSiteInput).toBeHidden();
    await expect(this.boardTokenInput).toBeHidden();
  }

  async checkPipelineToolFormVisible(selectName: string = 'BuildKite') {
    await expect(this.pipelineToolContainer).toBeVisible();
    await expect(this.pipelineToolTypeSelect).toBeVisible();
    await expect(await this.pipelineToolTypeSelect.textContent()).toContain(selectName);
    if (selectName !== 'Other') {
      await expect(this.pipelineToolTokenInput).toBeVisible();
    } else {
      await expect(this.pipelineToolTokenInput).not.toBeVisible();
    }
  }

  async checkPipelineToolFormInvisible() {
    await expect(this.pipelineToolContainer).toBeHidden();
    await expect(this.pipelineToolTypeSelect).toBeHidden();
    await expect(this.pipelineToolTokenInput).toBeHidden();
  }

  async checkSourceControlFormVisible() {
    await expect(this.sourceControlContainer).toBeVisible();
    await expect(this.sourceControlTypeSelect).toBeVisible();
    await expect(this.sourceControlTokenInput).toBeVisible();
  }

  async checkSourceControlFormInvisible() {
    await expect(this.sourceControlContainer).toBeHidden();
    await expect(this.sourceControlTypeSelect).toBeHidden();
    await expect(this.sourceControlTokenInput).toBeHidden();
  }

  async fillBoardConfigForm({ boardId, email, site, token }: IBoardData) {
    await this.boardIdInput.fill(boardId);
    await this.boardEmailInput.fill(email);
    await this.boardSiteInput.fill(site);
    await this.boardTokenInput.fill(token!);
  }

  async fillAndVerifyBoardConfig(boardData: IBoardData) {
    await this.fillBoardConfigForm(boardData);

    await expect(this.boardVerifyButton).toBeEnabled();

    await this.boardVerifyButton.click();

    await expect(this.boardVerifiedButton).toBeVisible();
  }

  async fillAndVerifyBoardTokenConfig(token: string) {
    await this.boardTokenInput.fill(token);

    await expect(this.boardVerifyButton).toBeEnabled();

    await this.boardVerifyButton.click();

    await expect(this.boardVerifiedButton).toBeVisible();
  }

  async resetBoardConfig() {
    await expect(this.boardResetButton).toBeEnabled();

    await this.boardResetButton.click();

    await this.resetDialogShow();

    await this.resetConfirmDialogClose.click();

    await expect(this.resetConfirmDialog).not.toBeVisible();
    await expect(this.boardResetButton).toBeEnabled();

    await this.boardResetButton.click();

    await this.resetDialogShow();

    await this.resetConfirmDialogCancelButton.click();

    await expect(this.resetConfirmDialog).not.toBeVisible();
    await expect(this.boardResetButton).toBeEnabled();

    await this.boardResetButton.click();

    await this.resetDialogShow();

    await this.resetConfirmDialogConfirmButton.click();

    await expect(this.resetConfirmDialog).not.toBeVisible();
    await expect(this.boardResetButton).not.toBeVisible();
  }

  async resetDialogShow() {
    await expect(this.resetConfirmDialog).toBeVisible();
    await expect(this.resetConfirmDialogClose).toBeVisible();
    await expect(this.resetConfirmDialogContent).toBeVisible();
    await expect(this.resetConfirmDialogCancelButton).toBeVisible();
    await expect(this.resetConfirmDialogConfirmButton).toBeVisible();
  }

  async fillPipelineToolForm({ token }: IPipelineToolData) {
    await this.pipelineToolTypeSelect.click();
    await this.pipelineToolTypeBuildKiteOption.click();
    await this.pipelineToolTokenInput.fill(token);
  }

  async clickOtherOptionInPipelineToolForm() {
    await this.pipelineToolTypeSelect.click();
    await expect(this.pipelineToolTypeOtherOption).toBeVisible();
    await this.pipelineToolTypeOtherOption.click();
  }

  async verifiedButtonInPipelineToolForm() {
    await expect(this.pipelineToolVerifiedButton).toBeVisible();
  }

  async verifiedButtonNotInPipelineToolForm() {
    await expect(this.pipelineToolVerifiedButton).not.toBeVisible();
  }

  async fillAndVerifyPipelineToolForm(pipelineToolData: IPipelineToolData) {
    await this.fillPipelineToolForm(pipelineToolData);

    await expect(this.pipelineToolVerifyButton).toBeEnabled();

    await this.pipelineToolVerifyButton.click();

    await this.verifiedButtonInPipelineToolForm();
  }

  async verifyButtonNotClickableInPipelineToolForm() {
    await expect(this.pipelineToolVerifyButton).toBeDisabled();
  }

  async verifyButtonNotExistInPipelineToolForm() {
    await expect(this.pipelineToolVerifyButton).not.toBeVisible();
  }

  async fillSourceControlForm({ token }: ISourceControlData) {
    await this.sourceControlTokenInput.fill(token);
  }

  async fillAndVerifySourceControlForm(sourceControlData: ISourceControlData) {
    await this.fillSourceControlForm(sourceControlData);

    await expect(this.sourceControlVerifyButton).toBeEnabled();

    await this.sourceControlVerifyButton.click();

    await expect(this.sourceControlVerifiedButton).toBeHidden();
  }

  async saveConfigStepAsJSONThenVerifyDownloadFile(json: typeof configStepData) {
    return downloadFileAndCheck(this.page, this.saveAsButton, METRICS_STEP_SAVING_FILENAME, async (fileDataString) => {
      const fileData = JSON.parse(fileDataString);
      expect(fileData).toEqual(json);
    });
  }

  async goToMetrics() {
    await this.nextButton.click();
  }

  async goToPreviousStep() {
    await this.previousButton.click();
  }

  async cancelGoToPreviousStep() {
    await this.previousModalCancelButton.click();
  }

  async confirmGoToPreviousStep() {
    await this.previousModalYesButton.click();
  }

  async addNewTimeRange() {
    await this.newTimeRangeButton.click();
  }

  async removeLastTimeRange() {
    await this.removeTimeRangeButtons.last().click();
  }

  async checkAllConfigInvalid() {
    await expect(this.boardTokenErrorMessage).toBeVisible();
    await expect(this.boardVerifyFailedPopupMessage).toBeVisible();
    await expect(this.pipelineTokenErrorMessage).toBeVisible();
    await expect(this.sourceControlTokenErrorMessage).toBeVisible();
  }
}

function covertToDateString(day: Dayjs): string | RegExp {
  return `${day.month() + 1} / ${day.date()} / ${day.year()}`;
}
