import {
  FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT,
  BOARD_METRICS_RESULT_MULTIPLE_RANGES,
  BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
  BOARD_METRICS_CYCLE_TIME_MULTIPLE_RANGES,
  BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
  BOARD_METRICS_REWORK_MULTIPLE_RANGES,
  BOARD_CSV_COMPARED_LINES,
  DORA_METRICS_RESULT_MULTIPLE_RANGES,
  CYCLE_TIME_WITH_ANALYSIS_STATUS_PROJECT_BOARD_METRICS_RESULT,
  DORA_METRICS_RESULT_FOR_SOURCE_CONTROL,
  DORA_METRICS_RESULT_WITH_PIPELINE_AND_SOURCE_CONTROL,
  DORA_METRICS_RESULT_WITH_PIPELINE_AND_SOURCE_CONTROL_DETAIL,
} from '../../fixtures/create-new/report-result';
import {
  DORA_CHART_PIPELINES,
  DORA_CHART_PIPELINES_WITH_PIPELINE_AND_SOURCE_CONTROL,
  DORA_CHART_VALUE,
  DORA_CHART_VALUE_WITH_PIPELINE_AND_SOURCE_CONTROL,
} from '../../fixtures/import-file/chart-result';
import { withPipelineAndSourceControlConfigurationConfig } from '../../fixtures/import-file/with-pipeline-and-source-control-configuration-config-file';
import { cycleTimeByStatusFixture } from '../../fixtures/cycle-time-by-status/cycle-time-by-status-fixture';
import { importMultipleDoneProjectFromFile } from '../../fixtures/import-file/multiple-done-config-file';
import { partialTimeRangesSuccess } from '../../fixtures/import-file/partial-time-ranges-success';
import { partialMetricsShowChart } from '../../fixtures/import-file/partial-metrics-show-chart';
import { selectNoneConfig } from '../../fixtures/import-file/select-none-config';
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
  await metricsStep.selectReworkSettings(importMultipleDoneProjectFromFile.reworkTimesSettings);
  await metricsStep.checkClassifications(importMultipleDoneProjectFromFile.classification);
  await metricsStep.checkClassificationCharts(importMultipleDoneProjectFromFile.classificationCharts);
  await metricsStep.checkPipelineConfigurationAreChanged(importMultipleDoneProjectFromFile.deployment);
  await metricsStep.removeSourceControl(0);

  await metricsStep.goToReportPage();
  await reportStep.checkProjectName(importMultipleDoneProjectFromFile.projectName);
  await reportStep.confirmGeneratedReport();
  await reportStep.checkShareReport();
  await reportStep.goToReportListTab();
  await reportStep.checkBoardMetricsForMultipleRanges(BOARD_METRICS_RESULT_MULTIPLE_RANGES);
  await reportStep.checkBoardMetricsDetailsForMultipleRanges({
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
    velocityData: BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
    cycleTimeData: BOARD_METRICS_CYCLE_TIME_MULTIPLE_RANGES,
    classificationData: BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
    reworkData: BOARD_METRICS_REWORK_MULTIPLE_RANGES,
    csvCompareLines: BOARD_CSV_COMPARED_LINES,
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
  const hbStateData = partialTimeRangesSuccess.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/partial-time-ranges-success.json');
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.checkSomeApiFailed(3);
  await metricsStep.checkCrewsAreChanged(partialTimeRangesSuccess.crews);
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.selectCycleTimeSettingsType(partialTimeRangesSuccess.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectAllPipelineCrews();
  await metricsStep.checkClassifications(partialTimeRangesSuccess.classification);
  await metricsStep.checkClassificationCharts(partialTimeRangesSuccess.classificationCharts);
  await metricsStep.removeSourceControl(0);
  await metricsStep.validateNextButtonClickable();
  await metricsStep.goToReportPage();

  await reportStep.checkProjectName(partialTimeRangesSuccess.projectName);
  await reportStep.confirmGeneratedReport();

  await reportStep.checkSelectListTab();
  await reportStep.goToChartBoardTab();
  await reportStep.checkChartBoardTabStatus({
    showVelocityChart: true,
    showReworkChart: true,
    showCycleTimeChart: true,
    showCycleTimeAllocationChart: true,
    showClassificationIssueTypeChart: true,
    showClassificationAssigneeChart: true,
    showReworkChartTrend: false,
  });
  await reportStep.goToCharDoraTab();
  await reportStep.checkPipelineSelectorAndDoraChart({
    doraChartValue: DORA_CHART_VALUE,
    pipelines: DORA_CHART_PIPELINES,
    showLeadTimeForChangeChart: true,
    showDeploymentFrequencyChart: true,
    showPipelineChangeFailureRateChart: true,
    showPipelineMeanTimeToRecoveryChart: true,
  });
});

test('Import project from file with no all metrics', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const hbStateData = partialTimeRangesSuccess.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/partial-metrics-show-chart.json');
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.checkSomeApiFailed(3);
  await metricsStep.checkCrewsAreChanged(partialMetricsShowChart.crews);
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.selectCycleTimeSettingsType(partialMetricsShowChart.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectAllPipelineCrews();
  await metricsStep.checkClassifications(partialMetricsShowChart.classification);
  await metricsStep.checkClassificationCharts(partialMetricsShowChart.classificationCharts);
  await metricsStep.removeSourceControl(0);
  await metricsStep.validateNextButtonClickable();
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();

  await reportStep.checkProjectName(partialMetricsShowChart.projectName);

  await reportStep.checkSelectListTab();
  await reportStep.goToChartBoardTab();
  await reportStep.checkChartBoardTabStatus({
    showVelocityChart: true,
    showReworkChart: false,
    showCycleTimeChart: true,
    showCycleTimeAllocationChart: true,
    showReworkChartTrend: true,
  });
  await reportStep.goToCharDoraTab();
  await reportStep.checkPipelineSelectorAndDoraChart({
    doraChartValue: DORA_CHART_VALUE,
    pipelines: DORA_CHART_PIPELINES,
    showPipelineChangeFailureRateChart: false,
    showPipelineMeanTimeToRecoveryChart: true,
    showLeadTimeForChangeChart: true,
    showDeploymentFrequencyChart: false,
  });
});

test('Import project from flag as block and without block column', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/add-flag-as-block-config-file.json');
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.checkCycleTimeConsiderCheckboxChecked();
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT);
  await reportStep.checkBoardDownloadDataWithoutBlock('../../fixtures/import-file/board-data-without-block-column.csv');
});

test('Import project from file with analysis board status', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/cycle-time-with-analysis-status.json');
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.checkCycleTimeConsiderCheckboxChecked();
  await metricsStep.removeSourceControl(0);
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(CYCLE_TIME_WITH_ANALYSIS_STATUS_PROJECT_BOARD_METRICS_RESULT);
  await reportStep.checkBoardDownloadDataWithoutBlock(
    '../../fixtures/import-file/board-data-with-analysis-board-status.csv',
    4,
  );
});

test('Import project from file when select none in pipeline tool configuration', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  const hbStateData = selectNoneConfig.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );
  const prefix = 'with-source-control-lead-time-';

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/select-none-in-pipeline-tool-configuration.json');
  await configStep.checkPipelineToolFormVisible('Other');
  await configStep.verifiedButtonNotInPipelineToolForm();
  await configStep.verifyButtonNotExistInPipelineToolForm();
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.checkCrewsAreChanged(selectNoneConfig.crews);
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectCycleTimeSettingsType(selectNoneConfig.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectReworkSettings(selectNoneConfig.reworkTimesSettings);
  await metricsStep.checkClassifications(selectNoneConfig.classification);
  await metricsStep.checkClassificationCharts(selectNoneConfig.classificationCharts);
  await metricsStep.checkSourceControlConfigurationAreChanged(selectNoneConfig.sourceControlConfigurationSettings);
  await metricsStep.selectGivenSourceControlCrews(selectNoneConfig.sourceControlCrews);

  await metricsStep.goToReportPage();
  await reportStep.confirmGeneratedReport();
  await reportStep.goToReportListTab();
  await reportStep.checkOnlyLeadTimeForChangesPartVisible();
  await reportStep.checkExportMetricDataButtonClickable();
  await reportStep.checkExportPipelineDataButtonClickable();
  await reportStep.checkBoardMetricsForMultipleRanges(BOARD_METRICS_RESULT_MULTIPLE_RANGES);
  await reportStep.checkBoardMetricsDetailsForMultipleRanges({
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
    velocityData: BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
    cycleTimeData: BOARD_METRICS_CYCLE_TIME_MULTIPLE_RANGES,
    classificationData: BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
    reworkData: BOARD_METRICS_REWORK_MULTIPLE_RANGES,
    csvCompareLines: BOARD_CSV_COMPARED_LINES,
  });
  await reportStep.checkDoraMetricsForMultipleRanges(DORA_METRICS_RESULT_FOR_SOURCE_CONTROL);
  await reportStep.checkDoraMetricsDetailsForMultipleRanges({
    doraMetricsReportData: DORA_METRICS_RESULT_FOR_SOURCE_CONTROL,
    projectCreationType: ProjectCreationType.IMPORT_PROJECT_FROM_FILE,
    fileNamePrefix: prefix,
  });
  await reportStep.checkMetricDownloadDataForMultipleRanges(3, prefix);
});

test.skip('Import project from file with pipeline and source control configuration', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  const fileNamePrefix = 'with-pipeline-and-source-control-configuration-';
  await homePage.goto();

  await homePage.importProjectFromFile(
    '../fixtures/input-files/lead-time-for-changes-with-pipeline-and-source-control-configuration.json',
  );
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.selectGivenPipelineCrews(withPipelineAndSourceControlConfigurationConfig.pipelineCrews);
  await metricsStep.checkPipelineConfigurationAreChanged(withPipelineAndSourceControlConfigurationConfig.deployment);
  await metricsStep.selectGivenSourceControlCrews(withPipelineAndSourceControlConfigurationConfig.sourceControlCrews);
  await metricsStep.checkSourceControlConfigurationAreChanged(
    withPipelineAndSourceControlConfigurationConfig.sourceControlConfigurationSettings,
  );
  await metricsStep.validateNextButtonClickable();

  await metricsStep.goToReportPage();
  await reportStep.checkProjectName(withPipelineAndSourceControlConfigurationConfig.projectName);
  await reportStep.confirmGeneratedReport();
  await reportStep.checkShareReport();
  await reportStep.goToReportListTab();
  await reportStep.checkDoraMetricsForMultipleRanges(DORA_METRICS_RESULT_WITH_PIPELINE_AND_SOURCE_CONTROL);
  await reportStep.checkDoraMetricsDetailsForMultipleRanges({
    doraMetricsReportData: DORA_METRICS_RESULT_WITH_PIPELINE_AND_SOURCE_CONTROL_DETAIL,
    projectCreationType: ProjectCreationType.IMPORT_PROJECT_FROM_FILE,
    showMoreIndex: 0,
    fileNamePrefix,
  });
  await reportStep.checkMetricDownloadDataForMultipleRanges(2, fileNamePrefix);
  await reportStep.goToChartBoardTab();
  await reportStep.goToCharDoraTab();
  await reportStep.checkPipelineSelectorAndDoraChart({
    doraChartValue: DORA_CHART_VALUE_WITH_PIPELINE_AND_SOURCE_CONTROL,
    pipelines: DORA_CHART_PIPELINES_WITH_PIPELINE_AND_SOURCE_CONTROL,
    showPipelineChangeFailureRateChart: true,
    showPipelineMeanTimeToRecoveryChart: true,
    showLeadTimeForChangeChart: true,
    showDeploymentFrequencyChart: true,
  });
});
