import {
  FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT,
  BOARD_METRICS_RESULT_MULTIPLE_RANGES,
  BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
  BOARD_METRICS_CYCLETIME_MULTIPLE_RANGES,
  BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
  BOARD_METRICS_REWORK_MULTIPLE_RANGES,
  BAORD_CSV_COMPARED_LINES,
  DORA_METRICS_RESULT_MULTIPLE_RANGES,
} from '../../fixtures/create-new/report-result';
import { cycleTimeByStatusFixture } from '../../fixtures/cycle-time-by-status/cycle-time-by-status-fixture';
import { importMultipleDoneProjectFromFile } from '../../fixtures/import-file/multiple-done-config-file';
import { config as metricsStepData } from '../../fixtures/create-new/metrics-step';
import { ProjectCreationType } from 'e2e/pages/metrics/report-step';
import { test } from '../../fixtures/test-with-extend-fixtures';
import { clearTempDir } from 'e2e/utils/clear-temp-dir';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Import project from file with all ranges API succeed', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
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
  await reportStep.checkBoardMetricsForMultipleRanges(BOARD_METRICS_RESULT_MULTIPLE_RANGES);
  await reportStep.checkBoardMetricsDetailsForMultipleRanges({
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
    velocityData: BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
    cycleTimeData: BOARD_METRICS_CYCLETIME_MULTIPLE_RANGES,
    classificationData: BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
    reworkData: BOARD_METRICS_REWORK_MULTIPLE_RANGES,
    csvCompareLines: BAORD_CSV_COMPARED_LINES,
  });
  await reportStep.checkDoraMetricsDetailsForMultipleRanges({
    doraMetricsReportData: DORA_METRICS_RESULT_MULTIPLE_RANGES,
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
  });
  await reportStep.checkMetricDownloadDataForMultipleRanges(3);
});

test('Import project from file with partial ranges API failed', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  const hbStateData = importMultipleDoneProjectFromFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  const hbStateDataEmptyByStatus = cycleTimeByStatusFixture.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/partial-time-ranges-success.json');
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.verifyAllConfig();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.checkSomeApiFailed(3);
  // await metricsStep.checkCrewsAreChanged(importMultipleDoneProjectFromFile.crews);
  // await metricsStep.checkLastAssigneeCrewFilterChecked();
  // await metricsStep.checkCycleTimeSettingIsByColumn();
  // await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  // await metricsStep.selectCycleTimeSettingsType(cycleTimeByStatusFixture.cycleTime.type);
  // await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, false);
  // await metricsStep.selectHeartbeatState(hbStateData, false);
  // await metricsStep.checkHeartbeatStateIsSet(hbStateData, false);
  // await metricsStep.selectCycleTimeSettingsType(importMultipleDoneProjectFromFile.cycleTime.type);
  // await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, true);
  // await metricsStep.selectHeartbeatState(hbStateData, true);
  // await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  // await metricsStep.selectGivenPipelineCrews(importMultipleDoneProjectFromFile.pipelineCrews);
  // await metricsStep.selectReworkSettings(metricsStepData.reworkTimesSettings);
  // await metricsStep.checkClassifications(importMultipleDoneProjectFromFile.classification);
  // await metricsStep.checkPipelineConfigurationAreChanged(importMultipleDoneProjectFromFile.deployment);

  // await metricsStep.goToReportPage();
  // await reportStep.confirmGeneratedReport();
  // await reportStep.checkBoardMetricsForMultipleRanges(BOARD_METRICS_RESULT_MULTIPLE_RANGES);
  // await reportStep.checkBoardMetricsDetailsForMultipleRanges({
  //   projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
  //   velocityData: BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
  //   cycleTimeData: BOARD_METRICS_CYCLETIME_MULTIPLE_RANGES,
  //   classificationData: BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
  //   reworkData: BOARD_METRICS_REWORK_MULTIPLE_RANGES,
  //   csvCompareLines: BAORD_CSV_COMPARED_LINES,
  // });
  // await reportStep.checkDoraMetricsDetailsForMultipleRanges({
  //   doraMetricsReportData: DORA_METRICS_RESULT_MULTIPLE_RANGES,
  //   projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
  // });
  // await reportStep.checkMetricDownloadDataForMultipleRanges(3);
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
  await reportStep.checkBoardMetrics(FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT);
  await reportStep.checkBoardDownloadDataWithoutBlock('../../fixtures/import-file/board-data-without-block-column.csv');
});
