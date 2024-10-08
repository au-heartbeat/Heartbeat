import {
  BOARD_METRICS_RESULT_MULTIPLE_RANGES,
  BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
  BOARD_METRICS_CYCLE_TIME_MULTIPLE_RANGES,
  BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
  BOARD_METRICS_REWORK_MULTIPLE_RANGES,
  DORA_METRICS_RESULT_MULTIPLE_RANGES,
  BOARD_METRICS_WITH_DESIGN_AND_WAITING_FOR_DEPLOYMENT_RESULT_MULTIPLE_RANGES,
  BOARD_METRICS_WITH_DESIGN_AND_WAITING_FOR_DEPLOYMENT_CYCLE_TIME,
  DORA_METRICS_RESULT_FOR_SOURCE_CONTROL,
} from '../../fixtures/create-new/report-result';
import {
  configWithDesignAndWaitingForDevelopmentStatus,
  configWithoutBlockColumn as metricsStepWithoutBlockColumnData,
} from '../../fixtures/create-new/metrics-step';
import { configWithoutBlockColumn as configWithoutBlockColumnData } from '../../fixtures/create-new/config-step';
import { cycleTimeByStatusFixture } from '../../fixtures/cycle-time-by-status/cycle-time-by-status-fixture';
import { BOARD_CSV_COMPARED_LINES } from '../../fixtures/create-new/report-result';
import { config as metricsStepData } from '../../fixtures/create-new/metrics-step';
import { selectNoneConfig } from '../../fixtures/import-file/select-none-config';
import { config as configStepData } from '../../fixtures/create-new/config-step';
import { ProjectCreationType } from 'e2e/pages/metrics/report-step';
import { test } from '../../fixtures/test-with-extend-fixtures';
import { clearTempDir } from 'e2e/utils/clear-temp-dir';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Create a new project', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const hbStateData = metricsStepData.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );
  const hbStateDataEmptyByStatus = cycleTimeByStatusFixture.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();
  await homePage.createANewProject();
  await configStep.waitForShown();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.clickPreviousButtonThenGoHome();
  await homePage.createANewProject();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.selectRegularCalendar(configStepData.calendarType);
  await configStep.typeInMultipleRanges(configStepData.dateRange);
  await configStep.selectAllRequiredMetrics();
  await configStep.checkBoardFormVisible();
  await configStep.checkPipelineToolFormVisible();
  await configStep.checkSourceControlFormVisible();
  await configStep.fillAndVerifyBoardConfig(configStepData.board);
  await configStep.resetBoardConfig();
  await configStep.fillAndVerifyBoardConfig(configStepData.board);
  await configStep.fillAndVerifyPipelineToolForm(configStepData.pipelineTool);
  await configStep.fillAndVerifySourceControlForm(configStepData.sourceControl);
  await configStep.saveConfigStepAsJSONThenVerifyDownloadFile(configStepData);
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.validateNextButtonNotClickable();
  await metricsStep.checkBoardConfigurationVisible();
  await metricsStep.checkPipelineConfigurationVisible();
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.waitForHiddenLoading();
  await metricsStep.selectCrews(metricsStepData.crews);
  await metricsStep.selectCycleTimeSettingsType(metricsStepData.cycleTime.type);
  await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, true);
  await metricsStep.selectCycleTimeSettingsType(cycleTimeByStatusFixture.cycleTime.type);
  await metricsStep.checkHeartbeatStateIsSet(hbStateDataEmptyByStatus, false);
  await metricsStep.selectHeartbeatState(hbStateData, false);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, false);
  await metricsStep.selectCycleTimeSettingsType(metricsStepData.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectClassifications(metricsStepData.classification);
  await metricsStep.selectClassificationCharts(metricsStepData.classificationCharts);
  await metricsStep.selectDefaultGivenPipelineSetting(metricsStepData.deployment);
  await metricsStep.selectAllPipelineCrews();
  await metricsStep.removeSourceControl(0);
  await metricsStep.selectReworkSettings(metricsStepData.reworkTimesSettings);
  await metricsStep.saveConfigStepAsJSONThenVerifyDownloadFile(metricsStepData);
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkProjectName(configStepData.projectName);
  await reportStep.goToReportListTab();
  await reportStep.checkExplanation();
  await reportStep.checkBoardMetricsForMultipleRanges(BOARD_METRICS_RESULT_MULTIPLE_RANGES);
  await reportStep.checkBoardMetricsDetailsForMultipleRanges({
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
    velocityData: BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
    cycleTimeData: BOARD_METRICS_CYCLE_TIME_MULTIPLE_RANGES,
    classificationData: BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
    reworkData: BOARD_METRICS_REWORK_MULTIPLE_RANGES,
    csvCompareLines: BOARD_CSV_COMPARED_LINES,
  });
  await reportStep.checkDoraMetricsForMultipleRanges(DORA_METRICS_RESULT_MULTIPLE_RANGES);
  await reportStep.checkDoraMetricsDetailsForMultipleRanges({
    doraMetricsReportData: DORA_METRICS_RESULT_MULTIPLE_RANGES,
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
  });
  await reportStep.checkMetricDownloadDataForMultipleRanges(3);
});

test('Create a new project without block column in boarding mapping', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  await homePage.goto();
  await homePage.createANewProject();
  await configStep.waitForShown();
  await configStep.typeInProjectName(configWithoutBlockColumnData.projectName);
  await configStep.selectRegularCalendar(configWithoutBlockColumnData.calendarType);
  await configStep.typeInMultipleRanges(configWithoutBlockColumnData.dateRange);
  await configStep.selectReworkTimesRequiredMetrics();
  await configStep.checkBoardFormVisible();
  await configStep.checkPipelineToolFormInvisible();
  await configStep.checkSourceControlFormInvisible();
  await configStep.fillAndVerifyBoardConfig(configWithoutBlockColumnData.board);
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.checkBoardConfigurationVisible();
  await metricsStep.checkPipelineConfigurationInvisible();
  await metricsStep.checkClassificationSettingInvisible();
  await metricsStep.checkClassificationChartSettingInvisible();
  await metricsStep.selectCrews(metricsStepWithoutBlockColumnData.crews);
  await metricsStep.selectCycleTimeSettingsType(metricsStepWithoutBlockColumnData.cycleTime.type);
  await metricsStep.checkCycleTimeConsiderCheckboxChecked();
  await metricsStep.selectHeartbeatStateWithoutBlock(
    metricsStepWithoutBlockColumnData.cycleTime.jiraColumns.map(
      (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
    ),
  );
  await metricsStep.selectReworkSettings(metricsStepWithoutBlockColumnData.reworkTimesSettings);
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkProjectName(configStepData.projectName);
  await reportStep.checkBoardDownloadDataWithoutBlockForMultipleRanges(3);
});

test('Create a new project with design and waiting for deployment in the cycle time status', async ({
  homePage,
  configStep,
  metricsStep,
  reportStep,
}) => {
  const hbStateData = configWithDesignAndWaitingForDevelopmentStatus.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );
  const fileNamePrefix = 'with-design-and-wait-for-deployment-';

  await homePage.goto();
  await homePage.createANewProject();
  await configStep.waitForShown();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.selectRegularCalendar(configStepData.calendarType);
  await configStep.typeInMultipleRanges(configStepData.dateRange);
  await configStep.selectAllRequiredMetrics();
  await configStep.checkBoardFormVisible();
  await configStep.checkPipelineToolFormVisible();
  await configStep.checkSourceControlFormVisible();
  await configStep.fillAndVerifyBoardConfig(configStepData.board);
  await configStep.fillAndVerifyPipelineToolForm(configStepData.pipelineTool);
  await configStep.fillAndVerifySourceControlForm(configStepData.sourceControl);
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.checkBoardConfigurationVisible();
  await metricsStep.checkPipelineConfigurationVisible();
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.waitForHiddenLoading();
  await metricsStep.selectCrews(configWithDesignAndWaitingForDevelopmentStatus.crews);
  await metricsStep.selectCycleTimeSettingsType(configWithDesignAndWaitingForDevelopmentStatus.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData, true);
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.selectClassifications(configWithDesignAndWaitingForDevelopmentStatus.classification);
  await metricsStep.selectClassificationCharts(configWithDesignAndWaitingForDevelopmentStatus.classificationCharts);
  await metricsStep.selectDefaultGivenPipelineSetting(configWithDesignAndWaitingForDevelopmentStatus.deployment);
  await metricsStep.selectAllPipelineCrews();
  await metricsStep.selectReworkSettings(configWithDesignAndWaitingForDevelopmentStatus.reworkTimesSettings);
  await metricsStep.saveConfigStepAsJSONThenVerifyDownloadFile(configWithDesignAndWaitingForDevelopmentStatus);
  await metricsStep.removeSourceControl(0);
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkProjectName(configWithDesignAndWaitingForDevelopmentStatus.projectName);
  await reportStep.goToReportListTab();
  await reportStep.checkExplanation();
  await reportStep.checkBoardMetricsForMultipleRanges(
    BOARD_METRICS_WITH_DESIGN_AND_WAITING_FOR_DEPLOYMENT_RESULT_MULTIPLE_RANGES,
  );
  await reportStep.checkBoardMetricsDetailsForMultipleRanges({
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
    velocityData: BOARD_METRICS_VELOCITY_MULTIPLE_RANGES,
    cycleTimeData: BOARD_METRICS_WITH_DESIGN_AND_WAITING_FOR_DEPLOYMENT_CYCLE_TIME,
    classificationData: BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES,
    reworkData: BOARD_METRICS_REWORK_MULTIPLE_RANGES,
    csvCompareLines: BOARD_CSV_COMPARED_LINES,
    fileNamePrefix,
  });
  await reportStep.checkDoraMetricsForMultipleRanges(DORA_METRICS_RESULT_MULTIPLE_RANGES);
  await reportStep.checkDoraMetricsDetailsForMultipleRanges({
    doraMetricsReportData: DORA_METRICS_RESULT_MULTIPLE_RANGES,
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
  });
  await reportStep.checkMetricDownloadDataForMultipleRanges(3, fileNamePrefix);
});

test('Create a new project with other pipeline setting', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const prefix = 'with-only-source-control-lead-time-';

  await homePage.goto();
  await homePage.createANewProject();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.selectRegularCalendar(configStepData.calendarType);
  await configStep.typeInMultipleRanges(configStepData.dateRange);
  await configStep.selectLeadTimeForChangesMetrics();
  await configStep.clickOtherOptionInPipelineToolForm();
  await configStep.checkPipelineToolFormVisible('Other');
  await configStep.checkSourceControlFormVisible();
  await configStep.fillAndVerifySourceControlForm(configStepData.sourceControl);
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.selectDefaultGivenSourceControlSetting(selectNoneConfig.sourceControlConfigurationSettings);
  await metricsStep.selectAllPipelineCrews(metricsStep.sourceControlCrewSettingsLabel);

  await metricsStep.goToReportPage();
  await reportStep.confirmGeneratedReport();
  await reportStep.goToReportListTab();
  await reportStep.checkOnlyLeadTimeForChangesPartVisible();
  await reportStep.checkExportMetricDataButtonClickable();
  await reportStep.checkExportPipelineDataButtonClickable();
  await reportStep.checkDoraMetricsForMultipleRanges(DORA_METRICS_RESULT_FOR_SOURCE_CONTROL);
  await reportStep.checkDoraMetricsDetailsForMultipleRanges({
    doraMetricsReportData: DORA_METRICS_RESULT_FOR_SOURCE_CONTROL,
    projectCreationType: ProjectCreationType.CREATE_A_NEW_PROJECT,
    fileNamePrefix: prefix,
    showMoreIndex: 0,
  });
  await reportStep.checkMetricDownloadDataForMultipleRanges(3, prefix);
});
