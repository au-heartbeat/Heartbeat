import { BOARD_METRICS_RESULT, DORA_METRICS_RESULT } from '../fixtures/cycleTimeByStatus/cycleTimeByStatusReportResult';
import { cycleTimeByStatusFixture } from '../fixtures/cycleTimeByStatus/cycleTimeByStatusFixture';
import { test } from '../fixtures/testWithExtendFixtures';
import { format } from '../utils/dateTime';

test('Create a new project with cycle time by status', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const dateRange = {
    startDate: format(cycleTimeByStatusFixture.dateRange.startDate),
    endDate: format(cycleTimeByStatusFixture.dateRange.endDate),
  };
  const hbStateDataByStatus = cycleTimeByStatusFixture.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();
  await homePage.createANewProject();
  await configStep.typeInProjectName(cycleTimeByStatusFixture.projectName);
  await configStep.selectRegularCalendar(cycleTimeByStatusFixture.calendarType);
  await configStep.typeInDateRange(dateRange);
  await configStep.selectAllRequiredMetrics();
  await configStep.checkBoardFormVisible();
  await configStep.checkPipelineToolFormVisible();
  await configStep.checkSourceControlFormVisible();
  await configStep.fillAndverifyBoardConfig(cycleTimeByStatusFixture.board);
  await configStep.fillAndVerifyPipelineToolForm(cycleTimeByStatusFixture.pipelineTool);
  await configStep.fillAndVerifySourceControlForm(cycleTimeByStatusFixture.sourceControl);
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.validateNextButtonNotClickable();
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeConsiderCheckboxChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.waitForHiddenLoading();
  await metricsStep.selectCrews(cycleTimeByStatusFixture.crews);

  await metricsStep.selectCycleTimeSettingsType(cycleTimeByStatusFixture.cycleTimeByStatus.type);
  await metricsStep.checkCycleTimeSettingIsByStatus();
  await metricsStep.selectHeartbeatStateByStatus(hbStateDataByStatus, false);

  await metricsStep.selectClassifications(cycleTimeByStatusFixture.classification);
  await metricsStep.selectDefaultGivenPipelineSetting(cycleTimeByStatusFixture.deployment);
  await metricsStep.selectGivenPipelineCrews(cycleTimeByStatusFixture.pipelineCrews);
  await metricsStep.selectReworkSettings(cycleTimeByStatusFixture.reworkTimesSettings);

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
  // await reportStep.checkBoardMetricsDetails(ProjectCreationType.CREATE_A_NEW_PROJECT, 9);
  await reportStep.checkDoraMetrics(
    DORA_METRICS_RESULT.PrLeadTime,
    DORA_METRICS_RESULT.PipelineLeadTime,
    DORA_METRICS_RESULT.TotalLeadTime,
    DORA_METRICS_RESULT.DeploymentFrequency,
    DORA_METRICS_RESULT.FailureRate,
    DORA_METRICS_RESULT.DevMeanTimeToRecovery,
  );
  // await reportStep.checkDoraMetricsDetails(ProjectCreationType.CREATE_A_NEW_PROJECT);
  await reportStep.checkMetricDownloadDataByStatus();
  await reportStep.checkDownloadReportsCycleTimeByStatus();

  // Test in the by column flow
  await homePage.goto();
  await homePage.createANewProject();
  await configStep.typeInProjectName(cycleTimeByStatusFixture.projectName);
  await configStep.selectRegularCalendar(cycleTimeByStatusFixture.calendarType);
  await configStep.typeInDateRange(dateRange);
  await configStep.selectAllRequiredMetrics();
  await configStep.checkBoardFormVisible();
  await configStep.checkPipelineToolFormVisible();
  await configStep.checkSourceControlFormVisible();
  await configStep.fillAndverifyBoardConfig(cycleTimeByStatusFixture.board);
  await configStep.fillAndVerifyPipelineToolForm(cycleTimeByStatusFixture.pipelineTool);
  await configStep.fillAndVerifySourceControlForm(cycleTimeByStatusFixture.sourceControl);
  await configStep.validateNextButtonClickable();
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.validateNextButtonNotClickable();
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeConsiderCheckboxChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.waitForHiddenLoading();
  await metricsStep.selectCrews(cycleTimeByStatusFixture.crews);

  await metricsStep.selectCycleTimeSettingsType(cycleTimeByStatusFixture.cycleTime.type);
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.selectHeartbeatStateByStatus(hbStateDataByStatus, true);

  await metricsStep.selectClassifications(cycleTimeByStatusFixture.classification);
  await metricsStep.selectDefaultGivenPipelineSetting(cycleTimeByStatusFixture.deployment);
  await metricsStep.selectGivenPipelineCrews(cycleTimeByStatusFixture.pipelineCrews);
  await metricsStep.selectReworkSettings(cycleTimeByStatusFixture.reworkTimesSettings);

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
  // await reportStep.checkBoardMetricsDetails(ProjectCreationType.CREATE_A_NEW_PROJECT, 9);
  await reportStep.checkDoraMetrics(
    DORA_METRICS_RESULT.PrLeadTime,
    DORA_METRICS_RESULT.PipelineLeadTime,
    DORA_METRICS_RESULT.TotalLeadTime,
    DORA_METRICS_RESULT.DeploymentFrequency,
    DORA_METRICS_RESULT.FailureRate,
    DORA_METRICS_RESULT.DevMeanTimeToRecovery,
  );
  // await reportStep.checkDoraMetricsDetails(ProjectCreationType.CREATE_A_NEW_PROJECT);
  await reportStep.checkMetricDownloadDataByStatus();
  await reportStep.checkDownloadReportsCycleTimeByStatus();
});
