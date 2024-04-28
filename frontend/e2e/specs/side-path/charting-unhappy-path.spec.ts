import { chartStepData } from '../../fixtures/import-file/chart-step-data';
import { test } from '../../fixtures/test-with-extend-fixtures';
import { clearTempDir } from '../../utils/clear-temp-dir';
import { format } from '../../utils/date-time';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Charting unhappy path on config and metri page', async ({ homePage, configStep, metricsStep }) => {
  const rightDateRange = {
    startDate: format(chartStepData.rightDateRange[0].startDate),
    endDate: format(chartStepData.rightDateRange[0].endDate),
    number: 0,
  };
  const rightDateRange1 = {
    startDate: format(chartStepData.rightDateRange[1].startDate),
    endDate: format(chartStepData.rightDateRange[1].endDate),
    number: 1,
  };
  const errorDateRange = {
    startDate: format(chartStepData.errorDateRange[0].startDate),
    endDate: format(chartStepData.errorDateRange[0].endDate),
  };

  const noCardDateRange = {
    startDate: format(chartStepData.noCardDateRange[0].startDate),
    endDate: format(chartStepData.noCardDateRange[0].endDate),
    number: 0,
  };

  const noCardDateRange1 = {
    startDate: format(chartStepData.noCardDateRange[1].startDate),
    endDate: format(chartStepData.noCardDateRange[1].endDate),
    number: 1,
  };
  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/charting-unhappy-path-config-file.json');

  await configStep.verifyAllConfig();
  await configStep.addNewTimeRange();
  await configStep.addNewTimeRange();
  await configStep.addNewTimeRange();
  await configStep.addNewTimeRange();
  await configStep.addNewTimeRange();
  await configStep.validateAddNewTimeRangeButtonNotClickable();
  await configStep.validateNextButtonNotClickable();

  await configStep.RemoveLastNewPipeline();
  await configStep.RemoveLastNewPipeline();
  await configStep.RemoveLastNewPipeline();
  await configStep.RemoveLastNewPipeline();
  await configStep.RemoveLastNewPipeline();
  await configStep.validateRemoveTimeRangeButtonIsHidden();

  await configStep.typeInDateRange(errorDateRange);
  await configStep.checkErrorStratTimeMessage();
  await configStep.checkErrorEndTimeMessage();
  await configStep.validateNextButtonNotClickable();

  await configStep.typeInDateRange(noCardDateRange);
  await configStep.addNewTimeRange();
  await configStep.typeInDateRange(noCardDateRange1);
  await configStep.selectAllRequiredMetrics();
  await configStep.selectBoardMetricsOnly();
  await configStep.goToMetrics();
  await metricsStep.checkBoardNoCard();
  await metricsStep.validateNextButtonNotClickable();
  await metricsStep.goToPreviousStep();

  await configStep.typeInDateRange(rightDateRange);
  await configStep.typeInDateRange(rightDateRange1);
  await configStep.selectAllRequiredMetrics();
  await configStep.goToMetrics();
  await metricsStep.deselectBranch(chartStepData.unSelectBranch);
  await metricsStep.addBranch(chartStepData.addNewBranch);
  await metricsStep.checkBranchIsInvalid();
  await metricsStep.validateNextButtonNotClickable();
});
