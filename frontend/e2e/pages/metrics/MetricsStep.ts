import { config as metricsStep } from '../../fixtures/metricsStep';
import { expect, Locator, Page } from '@playwright/test';

export class MetricsStep {
  readonly page: Page;
  readonly stepTitle: Locator;
  readonly nextButton: Locator;
  readonly boardConfigurationTitle: Locator;
  readonly pipelineConfigurationTitle: Locator;
  readonly lastAssigneeRadioBox: Locator;
  readonly cycleTimeSection: Locator;
  readonly considerAsBlockCheckbox: Locator;
  readonly byColumnRadioBox: Locator;
  readonly distinguishedBySelect: Locator;
  readonly loadings: Locator;
  readonly cycleTimeSelectForTODOSelect: Locator;
  readonly cycleTimeSelectForDoingSelect: Locator;
  readonly cycleTimeSelectForBlockedSelect: Locator;
  readonly cycleTimeSelectForReviewSelect: Locator;
  readonly cycleTimeSelectForREADYSelect: Locator;
  readonly cycleTimeSelectForTestingSelect: Locator;
  readonly cycleTimeSelectForDoneSelect: Locator;
  readonly organizationSelect: Locator;
  readonly stepSelect: Locator;
  readonly branchSelect: Locator;
  readonly branchSelectIndicator: Locator;

  readonly boardCrewSettingsLabel: Locator;
  readonly boardCrewSettingsAllOption: Locator;
  readonly boardCycleTimeSection: Locator;
  readonly boardConsiderAsBlockCheckbox: Locator;
  readonly boardByColumnRadioBox: Locator;
  readonly boardByStatusRadioBox: Locator;
  readonly boardCycleTimeTooltip: Locator;
  readonly boardCrewSettingContainer: Locator;
  readonly boardCrewSettingSelectedChips: Locator;
  readonly boardClassificationLabel: Locator;
  readonly boardClassificationContainer: Locator;
  readonly boardClassificationSelectedChips: Locator;

  readonly pipelineSettingSection: Locator;
  readonly pipelineOrganizationSelect: Locator;
  readonly pipelineNameSelect: Locator;
  readonly pipelineStepSelect: Locator;
  readonly pipelineBranchSelect: Locator;
  readonly pipelineDefaultBranchSelectContainer: Locator;
  readonly pipelineDefaultSelectedBranchChips: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stepTitle = page.getByText('Metrics', { exact: true });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.boardConfigurationTitle = page.getByText('Board configuration');
    this.pipelineConfigurationTitle = page.getByText('Pipeline configuration');
    this.lastAssigneeRadioBox = page.getByLabel('Last assignee');
    this.cycleTimeSection = page.getByLabel('Cycle time settings section');
    this.considerAsBlockCheckbox = this.cycleTimeSection.getByRole('checkbox');
    this.byColumnRadioBox = this.cycleTimeSection.getByLabel('By Column');
    this.distinguishedBySelect = page.getByLabel('Distinguished By *');
    this.loadings = this.page.getByTestId('loading');
    this.cycleTimeSelectForTODOSelect = page.getByLabel('Cycle time select for TODO').getByLabel('Open');
    this.cycleTimeSelectForDoingSelect = page.getByLabel('Cycle time select for Doing').getByLabel('Open');
    this.cycleTimeSelectForBlockedSelect = page.getByLabel('Cycle time select for Blocked').getByLabel('Open');
    this.cycleTimeSelectForReviewSelect = page.getByLabel('Cycle time select for Review').getByLabel('Open');
    this.cycleTimeSelectForREADYSelect = page.getByLabel('Cycle time select for READY').getByLabel('Open');
    this.cycleTimeSelectForTestingSelect = page.getByLabel('Cycle time select for Testing').getByLabel('Open');
    this.cycleTimeSelectForDoneSelect = page.getByLabel('Cycle time select for Done').getByLabel('Open');
    this.organizationSelect = page.getByLabel('Organization *');
    this.pipelineNameSelect = page.getByLabel('Pipeline Name *');
    this.stepSelect = page.getByLabel('Step *');
    this.branchSelect = page.getByLabel('Branches *');
    this.branchSelectIndicator = page.getByRole('progressbar');
    this.boardCycleTimeSection = page.getByLabel('Cycle time settings section');
    this.boardConsiderAsBlockCheckbox = this.boardCycleTimeSection.getByRole('checkbox');
    this.boardByColumnRadioBox = this.boardCycleTimeSection.getByLabel('By Column');
    this.boardByStatusRadioBox = this.boardCycleTimeSection.getByLabel('By Status');
    this.boardCycleTimeTooltip = this.boardCycleTimeSection.getByLabel('tooltip');
    this.boardCrewSettingsLabel = this.page.getByLabel('Included Crews *');
    this.boardCrewSettingsAllOption = this.page.getByRole('option', { name: 'All' });
    this.boardCrewSettingContainer = this.page.getByLabel('Included Crews multiple select');
    this.boardCrewSettingSelectedChips = this.boardCrewSettingContainer.getByRole('button').filter({ hasText: /.+/ });
    this.boardClassificationLabel = this.page.getByLabel('Distinguished By *');
    this.boardClassificationContainer = this.page.getByLabel('Classification Setting AutoComplete');
    this.boardClassificationSelectedChips = this.boardClassificationContainer
      .getByRole('button')
      .filter({ hasText: /.+/ });

    this.pipelineSettingSection = this.page.getByLabel('Pipeline Configuration Section');
    this.pipelineOrganizationSelect = this.pipelineSettingSection.getByLabel('Organization *');
    this.pipelineNameSelect = this.pipelineSettingSection.getByLabel('Pipeline Name *');
    this.pipelineStepSelect = this.pipelineSettingSection.getByLabel('Step *');
    this.pipelineBranchSelect = this.pipelineSettingSection.getByLabel('Branches *');
    this.pipelineDefaultBranchSelectContainer = this.pipelineSettingSection.getByLabel('Pipeline Branch AutoComplete');
    this.pipelineDefaultSelectedBranchChips = this.pipelineDefaultBranchSelectContainer
      .getByRole('button')
      .filter({ hasText: /.+/ });
  }

  async waitForShown() {
    await expect(this.stepTitle).toHaveClass(/Mui-active/);
  }

  async validateNextButtonNotClickable() {
    await expect(this.nextButton).toBeDisabled();
  }

  async checkBoardConfigurationVisible() {
    await expect(this.boardConfigurationTitle).toBeVisible();
  }

  async checkPipelineConfigurationVisible() {
    await expect(this.pipelineConfigurationTitle).toBeVisible();
  }

  async checkLastAssigneeCrewFilterChecked() {
    await expect(this.lastAssigneeRadioBox).toBeVisible();
    await expect(this.lastAssigneeRadioBox).toBeChecked();
  }

  async checkCycleTimeConsiderCheckboxChecked() {
    await expect(this.boardConsiderAsBlockCheckbox).toBeChecked();
  }

  async checkCycleTimeSettingIsByColumn() {
    await expect(this.boardByColumnRadioBox).toBeChecked();
  }

  async checkCycleTimeSettingsTooltip() {
    await expect(this.boardCycleTimeTooltip).toBeVisible();
    await this.boardCycleTimeTooltip.hover();
    await expect(
      this.page.getByText('The report page will sum all the status in the column for cycletime calculation'),
    ).toBeVisible();
  }

  async checkCrewSettingsVisible(crews: string[]) {
    await expect(this.boardCrewSettingsLabel).toBeVisible();
    await this.boardCrewSettingsLabel.click();
    await expect(this.boardCrewSettingsAllOption).toBeVisible();
    const crewsLocators = crews.map((crew) => expect(this.page.getByRole('option', { name: crew })).toBeVisible());
    await Promise.all(crewsLocators);
    await this.page.keyboard.press('Escape');
  }

  async selectGivenCrews(crews: string[]) {
    await this.boardCrewSettingsLabel.click();
    const options = this.page.getByRole('option');
    for (const option of (await options.all()).slice(1)) {
      const optionName = (await option.textContent()) as string;
      const isOptionSelected = (await option.getAttribute('aria-selected')) === 'true';
      if (crews.includes(optionName)) {
        if (!isOptionSelected) {
          await option.click();
        }
      } else {
        if (isOptionSelected) {
          await option.click();
        }
      }
    }

    await expect(this.boardCrewSettingSelectedChips).toHaveCount(crews.length);
    crews.forEach(async (crew) => {
      await expect(this.boardCrewSettingContainer.getByRole('button', { name: crew })).toBeVisible();
    });
    await this.page.keyboard.press('Escape');
  }

  async selectboardByStatusRadioBox() {
    await this.boardByStatusRadioBox.check();
    await expect(this.boardByStatusRadioBox).toBeChecked();
  }

  async selectGivenClassifications(classificationKeys: string[]) {
    await this.boardClassificationLabel.click();
    const options = this.page.getByRole('option');
    for (const option of (await options.all()).slice(1)) {
      const optionKey = (await option.getAttribute('data-testid')) as string;
      const isOptionSelected = (await option.getAttribute('aria-selected')) === 'true';
      if (classificationKeys.includes(optionKey)) {
        if (!isOptionSelected) {
          await option.click();
        }
      } else {
        if (isOptionSelected) {
          await option.click();
        }
      }
    }

    await expect(this.boardClassificationSelectedChips).toHaveCount(classificationKeys.length);
    await this.page.keyboard.press('Escape');
  }

  async selectGivenPipelineBranches(branches: string[]) {
    await this.pipelineBranchSelect.click();
    const options = this.page.getByRole('option');
    for (const option of (await options.all()).slice(1)) {
      const optionName = (await option.textContent()) as string;
      const isOptionSelected = (await option.getAttribute('aria-selected')) === 'true';
      if (branches.includes(optionName)) {
        if (!isOptionSelected) {
          await option.click();
        }
      } else {
        if (isOptionSelected) {
          await option.click();
        }
      }
    }

    await expect(this.pipelineDefaultSelectedBranchChips).toHaveCount(branches.length);
    await this.page.keyboard.press('Escape');
  }

  async selectDefaultGivenPipelineSetting(pipelineSettings: typeof metricsStep.deployment) {
    const firstPipelineConfig = pipelineSettings[0];
    await this.pipelineOrganizationSelect.click();
    const targetOrganizationOption = this.page.getByRole('option', { name: firstPipelineConfig.organization });
    await expect(targetOrganizationOption).toBeVisible();
    await targetOrganizationOption.click();

    await this.pipelineNameSelect.click();
    const targetNameOption = this.page.getByRole('option', { name: firstPipelineConfig.pipelineName });
    await expect(targetNameOption).toBeVisible();
    await targetNameOption.click();

    await this.pipelineStepSelect.click();
    const emojiRegExp = /:.+:/;
    const emoji = firstPipelineConfig.step.match(emojiRegExp);
    let stepName = '';
    if (emoji === null) {
      stepName = firstPipelineConfig.step;
    } else {
      const splitor = emoji as unknown as string;
      stepName = firstPipelineConfig.step.split(splitor)[1];
    }
    const targetStepOption = this.page.getByRole('option', { name: stepName });
    await expect(targetStepOption).toBeVisible();
    await targetStepOption.click();

    await this.selectGivenPipelineBranches(firstPipelineConfig.branches);
  }
  async waitForHiddenLoading() {
    await expect(this.loadings.first()).toBeHidden();
  }
  async selectHeartbeatState(
    todoOption: string,
    doingOption: string,
    blockOption: string,
    reviewOption: string,
    forReadyOption: string,
    testingOption: string,
    doneOption: string,
  ) {
    await this.cycleTimeSelectForTODOSelect.click();
    await this.page.getByRole('option', { name: todoOption }).click();

    await this.cycleTimeSelectForDoingSelect.click();
    await this.page.getByRole('option', { name: doingOption }).click();

    await this.cycleTimeSelectForBlockedSelect.click();
    await this.page.getByRole('option', { name: blockOption }).click();

    await this.cycleTimeSelectForReviewSelect.click();
    await this.page.getByRole('option', { name: reviewOption }).click();

    await this.cycleTimeSelectForREADYSelect.click();
    await this.page.getByRole('option', { name: forReadyOption }).click();

    await this.cycleTimeSelectForTestingSelect.click();
    await this.page.getByRole('option', { name: testingOption, exact: true }).click();

    await this.cycleTimeSelectForDoneSelect.click();
    await this.page.getByRole('option', { name: doneOption }).click();
  }

  async selectDistinguishedByOptions() {
    await this.distinguishedBySelect.click();
    await this.page.getByRole('option', { name: 'All' }).click();
    await this.page.getByRole('option', { name: 'Design' }).click();
  }

  async selectPipelineSetting() {
    await this.selectOrganization('Thoughtworks-Heartbeat');
    await this.selectPipelineName('Heartbeat');
    await this.selectStep('Deploy prod');
    await this.selectBranch('main');
  }

  async selectOrganization(orgName: string) {
    await expect(this.loadings).toBeHidden();
    await this.organizationSelect.click();
    await this.page.getByRole('option', { name: orgName }).click();
  }

  async selectPipelineName(pipelineName: string) {
    await this.pipelineNameSelect.click();
    await this.page.getByRole('option', { name: pipelineName }).click();
    await expect(this.loadings).toBeHidden();
  }

  async selectStep(doneStep: string) {
    await this.stepSelect.click();
    await this.page.getByRole('option', { name: doneStep }).click();
    await expect(this.page.getByTestId('loading')).toBeHidden();
    await expect(this.page.getByTestId('loading')).toBeHidden();
  }

  async selectBranch(branchName: string) {
    await this.branchSelect.click();
    await this.page.getByRole('combobox', { name: 'Branches' }).fill('main');
    await this.page.getByRole('option', { name: branchName }).getByRole('checkbox').check();
    // await expect(this.page.getByTestId('CancelIcon')).toBeVisible();
    await expect(this.branchSelectIndicator).toBeHidden();
  }

  async goToReportPage() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }
}
