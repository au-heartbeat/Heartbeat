import { BOARD_METRICS_RESULT, DORA_METRICS_RESULT } from '../fixtures/createNew/reportResult';
import { config as metricsStepData } from '../fixtures/createNew/metricsStep';
import { config as configStepData } from '../fixtures/createNew/configStep';
import { test } from '../fixtures/testWithExtendFixtures';
import { clearTempDir } from 'e2e/utils/clearTempDir';
import { format } from 'e2e/utils/dateTime';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Page jump for create', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const dateRange = {
    startDate: format(configStepData.dateRange.startDate),
    endDate: format(configStepData.dateRange.endDate),
  };
  const hbStateData = metricsStepData.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();
  await homePage.createANewProject();
  await configStep.waitForShown();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.selectRegularCalendar(configStepData.calendarType);
  await configStep.typeInDateRange(dateRange);
  await configStep.selectAllRequiredMetrics();
  await configStep.fillAndverifyBoardConfig(configStepData.board);
  await configStep.fillAndVerifyPipelineToolForm(configStepData.pipelineTool);
  await configStep.fillAndVerifySourceControlForm(configStepData.sourceControl);
  await configStep.goToMetrics();

  await metricsStep.waitForShown();
  await metricsStep.waitForHiddenLoading();
  await metricsStep.selectCrews(metricsStepData.crews);
  await metricsStep.selectCycleTimeSettingsType(metricsStepData.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData);
  await metricsStep.selectClassifications(metricsStepData.classification);
  await metricsStep.selectDefaultGivenPipelineSetting(metricsStepData.deployment);
  await metricsStep.selectGivenPipelineCrews(metricsStepData.pipelineCrews);

  await metricsStep.goToPreviousStep();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.waitForHiddenLoading();
  await metricsStep.checkCrews(metricsStepData.crews);

  // wait to delete when ADM-821 is done
  await metricsStep.selectCycleTimeSettingsType(metricsStepData.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData);
  await metricsStep.selectClassifications(metricsStepData.classification);

  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(
    BOARD_METRICS_RESULT.Velocity,
    BOARD_METRICS_RESULT.Throughput,
    BOARD_METRICS_RESULT.AverageCycleTime4SP,
    BOARD_METRICS_RESULT.AverageCycleTime4Card,
  );
  await reportStep.checkBoardMetricsDetails('create-a-new-project-Board-Metrics.png', 9);
  await reportStep.checkDoraMetrics(
    DORA_METRICS_RESULT.PrLeadTime,
    DORA_METRICS_RESULT.PipelineLeadTime,
    DORA_METRICS_RESULT.TotalLeadTime,
    DORA_METRICS_RESULT.DeploymentFrequency,
    DORA_METRICS_RESULT.FailureRate,
    DORA_METRICS_RESULT.MeanTimeToRecovery,
  );
  await reportStep.checkDoraMetricsDetails('create-a-new-project-DORA-Metrics.png');
  await reportStep.checkMetricDownloadData();
});
