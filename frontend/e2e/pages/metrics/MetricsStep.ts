import { config as metricsStep } from '../../fixtures/metricsStep';
import { expect, Locator, Page } from '@playwright/test';

export class MetricsStep {
  readonly page: Page;
  readonly stepTitle: Locator;
  readonly nextButton: Locator;
  readonly boardConfigurationTitle: Locator;
  readonly pipelineConfigurationTitle: Locator;
  readonly loadings: Locator;

  readonly boardCrewSettingsLabel: Locator;
  readonly boardCrewSettingChipsContainer: Locator;
  readonly boardCrewSettingSelectedChips: Locator;
  readonly boardLastAssigneeRadioBox: Locator;
  readonly boardCycleTimeSection: Locator;
  readonly boardByColumnRadioBox: Locator;
  readonly boardByStatusRadioBox: Locator;
  readonly boardCycleTimeSelectForTODO: Locator;
  readonly boardCycleTimeSelectForDoing: Locator;
  readonly boardCycleTimeSelectForBlocked: Locator;
  readonly boardCycleTimeSelectForReview: Locator;
  readonly boardCycleTimeSelectForREADY: Locator;
  readonly boardCycleTimeSelectForTesting: Locator;
  readonly boardCycleTimeSelectForDone: Locator;
  readonly boardConsiderAsBlockCheckbox: Locator;
  readonly boardClassificationLabel: Locator;
  readonly boardClassificationChipsContainer: Locator;
  readonly boardClassificationSelectedChips: Locator;

  readonly pipelineSettingSection: Locator;
  readonly pipelineOrganizationSelect: Locator;
  readonly pipelineNameSelect: Locator;
  readonly pipelineStepSelect: Locator;
  readonly pipelineBranchSelect: Locator;
  readonly pipelineDefaultBranchSelectContainer: Locator;
  readonly pipelineDefaultSelectedBranchChips: Locator;
  readonly pipelineBranchSelectIndicator: Locator;
  readonly pipelineBranchesErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stepTitle = page.getByText('Metrics', { exact: true });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.boardConfigurationTitle = page.getByText('Board configuration');
    this.pipelineConfigurationTitle = page.getByText('Pipeline configuration');
    this.loadings = page.getByTestId('loading');

    this.boardCrewSettingsLabel = page.getByLabel('Included Crews *');
    this.boardCrewSettingChipsContainer = page.getByLabel('Included Crews multiple select').first();
    this.boardCrewSettingSelectedChips = this.boardCrewSettingChipsContainer
      .getByRole('button')
      .filter({ hasText: /.+/ });
    this.boardLastAssigneeRadioBox = page.getByLabel('Last assignee');
    this.boardCycleTimeSection = page.getByLabel('Cycle time settings section');
    this.boardByColumnRadioBox = this.boardCycleTimeSection.getByLabel('By Column');
    this.boardByStatusRadioBox = this.boardCycleTimeSection.getByLabel('By Status');
    this.boardCycleTimeSelectForTODO = this.boardCycleTimeSection
      .getByLabel('Cycle time select for TODO')
      .getByLabel('Open');
    this.boardCycleTimeSelectForDoing = this.boardCycleTimeSection
      .getByLabel('Cycle time select for Doing')
      .getByLabel('Open');
    this.boardCycleTimeSelectForBlocked = this.boardCycleTimeSection
      .getByLabel('Cycle time select for Blocked')
      .getByLabel('Open');
    this.boardCycleTimeSelectForReview = this.boardCycleTimeSection
      .getByLabel('Cycle time select for Review')
      .getByLabel('Open');
    this.boardCycleTimeSelectForREADY = this.boardCycleTimeSection
      .getByLabel('Cycle time select for READY FOR TESTING')
      .getByLabel('Open');
    this.boardCycleTimeSelectForTesting = this.boardCycleTimeSection
      .getByLabel('Cycle time select for Testing')
      .getByLabel('Open');
    this.boardCycleTimeSelectForDone = this.boardCycleTimeSection
      .getByLabel('Cycle time select for Done')
      .getByLabel('Open');
    this.boardConsiderAsBlockCheckbox = this.boardCycleTimeSection.getByRole('checkbox');
    this.boardClassificationLabel = page.getByLabel('Distinguished By *');
    this.boardClassificationChipsContainer = page.getByLabel('Classification Setting AutoComplete');
    this.boardClassificationSelectedChips = this.boardClassificationChipsContainer
      .getByRole('button')
      .filter({ hasText: /.+/ });

    this.pipelineSettingSection = page.getByLabel('Pipeline Configuration Section');
    this.pipelineOrganizationSelect = this.pipelineSettingSection.getByLabel('Organization *');
    this.pipelineNameSelect = this.pipelineSettingSection.getByLabel('Pipeline Name *');
    this.pipelineStepSelect = this.pipelineSettingSection.getByLabel('Step *');
    this.pipelineBranchSelect = this.pipelineSettingSection.getByLabel('Branches *');
    this.pipelineDefaultBranchSelectContainer = this.pipelineSettingSection.getByLabel('Pipeline Branch AutoComplete');
    this.pipelineDefaultSelectedBranchChips = this.pipelineDefaultBranchSelectContainer
      .getByRole('button')
      .filter({ hasText: /.+/ });
    this.pipelineBranchesErrorMessage = page.getByText('The codebase branch marked in red is invalid!');
    this.pipelineBranchSelectIndicator = page.getByRole('progressbar');
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
    await expect(this.boardLastAssigneeRadioBox).toBeVisible();
    await expect(this.boardLastAssigneeRadioBox).toBeChecked();
  }

  async checkCycleTimeConsiderCheckboxChecked() {
    await expect(this.boardConsiderAsBlockCheckbox).toBeChecked();
  }

  async checkCycleTimeSettingIsByColumn() {
    await expect(this.boardByColumnRadioBox).toBeChecked();
  }

  async selectBoardGivenCrews(crews: string[]) {
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
      await expect(this.boardCrewSettingChipsContainer.getByRole('button', { name: crew })).toBeVisible();
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

  async waitForHiddenLoading() {
    await expect(this.loadings.first()).toBeHidden();
  }

  async selectCycleTimeSettingsType(by: string) {
    if (by === 'byColumn') {
      await this.boardByColumnRadioBox.click();
      await expect(this.boardByColumnRadioBox).toBeChecked();
    } else {
      await this.boardByStatusRadioBox.click();
      await expect(this.boardByStatusRadioBox).toBeChecked();
    }
  }

  async selectHeartbeatState([
    todoOption,
    doingOption,
    blockOption,
    reviewOption,
    forReadyOption,
    testingOption,
    doneOption,
  ]: string[]) {
    await this.boardCycleTimeSelectForTODO.click();
    await this.page.getByRole('option', { name: todoOption }).click();

    await this.boardCycleTimeSelectForDoing.click();
    await this.page.getByRole('option', { name: doingOption }).click();

    await this.boardCycleTimeSelectForBlocked.click();
    await this.page.getByRole('option', { name: blockOption }).click();

    await this.boardCycleTimeSelectForReview.click();
    await this.page.getByRole('option', { name: reviewOption }).click();

    await this.boardCycleTimeSelectForREADY.click();
    await this.page.getByRole('option', { name: forReadyOption }).click();

    await this.boardCycleTimeSelectForTesting.click();
    await this.page.getByRole('option', { name: testingOption, exact: true }).click();

    await this.boardCycleTimeSelectForDone.click();
    await this.page.getByRole('option', { name: doneOption }).click();
  }

  async selectOrganization(orgName: string) {
    await expect(this.loadings).toBeHidden();
    await this.pipelineOrganizationSelect.click();
    const targetOrganizationOption = this.page.getByRole('option', { name: orgName });
    await expect(targetOrganizationOption).toBeVisible();
    await targetOrganizationOption.click();
  }

  async selectPipelineName(pipelineName: string) {
    await this.pipelineNameSelect.click();
    const targetNameOption = this.page.getByRole('option', { name: pipelineName });
    await expect(targetNameOption).toBeVisible();
    await targetNameOption.click();
    await expect(this.loadings).toBeHidden();
  }

  async selectStep(doneStepMaybeWithEmoji: string) {
    await this.pipelineStepSelect.click();
    const emojiRegExp = /:.+:/;
    const emoji = doneStepMaybeWithEmoji.match(emojiRegExp);
    let stepName = '';
    if (emoji === null) {
      stepName = doneStepMaybeWithEmoji;
    } else {
      const splitor = emoji as unknown as string;
      stepName = doneStepMaybeWithEmoji.split(splitor)[1];
    }
    const targetStepOption = this.page.getByRole('option', { name: stepName });
    await expect(targetStepOption).toBeVisible();
    await targetStepOption.click();
    await expect(this.loadings).toBeHidden();
  }

  async selectBranch(branches: string[]) {
    await this.pipelineBranchSelect.click();
    for (const branchName of branches) {
      await this.page.getByRole('combobox', { name: 'Branches' }).fill(branchName);
      await this.page.getByRole('option', { name: branchName }).getByRole('checkbox').check();
      await expect(this.pipelineBranchSelectIndicator).toBeHidden();
    }
    await expect(this.pipelineDefaultSelectedBranchChips).toHaveCount(branches.length);
    await expect(this.pipelineBranchesErrorMessage).not.toBeVisible();
  }

  async selectDefaultGivenPipelineSetting(pipelineSettings: typeof metricsStep.deployment) {
    const firstPipelineConfig = pipelineSettings[0];

    await this.selectOrganization(firstPipelineConfig.organization);
    await this.selectPipelineName(firstPipelineConfig.pipelineName);
    await this.selectStep(firstPipelineConfig.step);
    await this.selectBranch(firstPipelineConfig.branches);
  }

  async goToReportPage() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }
}
