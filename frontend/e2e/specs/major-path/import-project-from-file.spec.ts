import {
  BOARD_METRICS_RESULT,
  BOARD_METRICS_WITH_HOLIDAY_RESULT,
  DORA_METRICS_WITH_HOLIDAY_RESULT,
  FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT,
} from '../../fixtures/create-new/report-result';
import { calculateWithHolidayConfigFile } from '../../fixtures/import-file/calculate-with-holiday-config-file';
import { cycleTimeByStatusFixture } from '../../fixtures/cycle-time-by-status/cycle-time-by-status-fixture';
import { importMultipleDoneProjectFromFile } from '../../fixtures/import-file/multiple-done-config-file';
import { config as metricsStepData } from '../../fixtures/create-new/metrics-step';
import adjustBrowserTimezone from '../../utils/set-chrome-default-timezone';
import { ProjectCreationType } from 'e2e/pages/metrics/report-step';
import { test } from '../../fixtures/test-with-extend-fixtures';
import { clearTempDir } from 'e2e/utils/clear-temp-dir';

test.beforeAll(async () => {
  await clearTempDir();
  await adjustBrowserTimezone();
});

test('Import project from file', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const hbStateData = importMultipleDoneProjectFromFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  const hbStateDataEmptyByStatus = cycleTimeByStatusFixture.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/multiple-done-config-file.json');
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.verifyAllConfig();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();

  // To verify board configuration matches json file data
  await metricsStep.checkCrewsAreChanged(importMultipleDoneProjectFromFile.crews);
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);

  await metricsStep.selectCycleTimeSettingsType(cycleTimeByStatusFixture.cycleTime.type);
  await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, false);
  await metricsStep.selectHeartbeatState(hbStateData, false);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, false);

  await metricsStep.selectCycleTimeSettingsType(importMultipleDoneProjectFromFile.cycleTime.type);
  await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, true);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectGivenPipelineCrews(importMultipleDoneProjectFromFile.pipelineCrews);

  await metricsStep.selectReworkSettings(metricsStepData.reworkTimesSettings);

  await metricsStep.checkClassifications(importMultipleDoneProjectFromFile.classification);
  await metricsStep.checkPipelineConfigurationAreChanged(importMultipleDoneProjectFromFile.deployment);

  await metricsStep.goToReportPage();
  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(
    BOARD_METRICS_RESULT.Velocity,
    BOARD_METRICS_RESULT.Throughput,
    BOARD_METRICS_RESULT.AverageCycleTime4SP,
    BOARD_METRICS_RESULT.AverageCycleTime4Card,
    BOARD_METRICS_RESULT.totalReworkTimes,
    BOARD_METRICS_RESULT.totalReworkCards,
    BOARD_METRICS_RESULT.reworkCardsRatio,
    BOARD_METRICS_RESULT.throughput,
  );
  await reportStep.checkBoardMetricsDetails(ProjectCreationType.IMPORT_PROJECT_FROM_FILE, 9);
  await reportStep.checkDoraMetricsDetails(ProjectCreationType.IMPORT_PROJECT_FROM_FILE);
  await reportStep.checkDownloadReports();
});

test('Import project from file with holiday', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const hbStateData = calculateWithHolidayConfigFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  const hbStateDataEmptyByStatus = cycleTimeByStatusFixture.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/calculate-with-holiday-config-file.json');
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.verifyAllConfig();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();

  // To verify board configuration matches json file data
  await metricsStep.checkCrewsAreChanged(calculateWithHolidayConfigFile.crews);
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);

  await metricsStep.selectCycleTimeSettingsType(cycleTimeByStatusFixture.cycleTime.type);
  await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, false);
  await metricsStep.selectHeartbeatState(hbStateData, false);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, false);

  await metricsStep.selectCycleTimeSettingsType(calculateWithHolidayConfigFile.cycleTime.type);
  await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, true);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);

  await metricsStep.selectReworkSettings(metricsStepData.reworkTimesSettings);

  await metricsStep.checkClassifications(calculateWithHolidayConfigFile.classification);
  await metricsStep.checkPipelineConfigurationAreChanged(calculateWithHolidayConfigFile.deployment);

  await metricsStep.goToReportPage();
  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(
    BOARD_METRICS_WITH_HOLIDAY_RESULT.Velocity,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.Throughput,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.AverageCycleTime4SP,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.AverageCycleTime4Card,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.totalReworkTimes,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.totalReworkCards,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.reworkCardsRatio,
    BOARD_METRICS_WITH_HOLIDAY_RESULT.throughput,
  );
  await reportStep.checkDoraMetrics(
    DORA_METRICS_WITH_HOLIDAY_RESULT.PrLeadTime,
    DORA_METRICS_WITH_HOLIDAY_RESULT.PipelineLeadTime,
    DORA_METRICS_WITH_HOLIDAY_RESULT.TotalLeadTime,
    DORA_METRICS_WITH_HOLIDAY_RESULT.DeploymentFrequency,
    DORA_METRICS_WITH_HOLIDAY_RESULT.FailureRate,
    DORA_METRICS_WITH_HOLIDAY_RESULT.DevMeanTimeToRecovery,
  );
  await reportStep.checkDownloadWithHolidayReports();
});

test('Import project from flag as block and without block column', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/add-flag-as-block-config-file.json');
  await configStep.verifyBoardConfig();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.checkCycleTimeConsiderCheckboxChecked();
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.Velocity,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.Throughput,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.AverageCycleTime4SP,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.AverageCycleTime4Card,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.totalReworkTimes,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.totalReworkCards,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.reworkCardsRatio,
    FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT.throughput,
  );
  await reportStep.checkBoardDownloadDataWithoutBlock('../../fixtures/import-file/board-data-without-block-column.csv');
});
