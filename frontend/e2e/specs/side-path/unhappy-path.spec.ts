import {
  importInputWrongProjectFromFile as importUnhappyPathProjectFromFile,
  importModifiedCorrectConfig as modifiedCorrectProjectFromFile,
} from '../../fixtures/import-file/unhappy-path-file';
import { BOARD_METRICS_RESULT, DORA_METRICS_RESULT } from '../../fixtures/create-new/report-result';
import { test } from '../../fixtures/test-with-extend-fixtures';
import { clearTempDir } from '../../utils/clear-temp-dir';
import { format } from '../../utils/date-time';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Error UI should be pipeline with no org config when pipeline token without org', async ({
  homePage,
  configStep,
  metricsStep,
}) => {
  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/pipeline-no-org-config-file.json');
  await configStep.goToMetrics();
  await metricsStep.waitForShown();

  await metricsStep.checkErrorMessageForPipelineSettings();
});

test('unhappy path when import file', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const dateRange = {
    startDate: format(modifiedCorrectProjectFromFile.dateRange.startDate),
    endDate: format(modifiedCorrectProjectFromFile.dateRange.endDate),
  };

  const hbStateData = importUnhappyPathProjectFromFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  const ModifiedhbStateData = modifiedCorrectProjectFromFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/unhappy-path-config-file.json');
  await configStep.checkRemindImportedDataNotMatched();
  await configStep.checkProjectName(importUnhappyPathProjectFromFile.projectName);
  await configStep.checkAllConfigInvalid();
  await configStep.validateNextButtonNotClickable();
  await configStep.typeInProjectName(modifiedCorrectProjectFromFile.projectName);
  await configStep.fillAndVerifyBoardTokenConfig(modifiedCorrectProjectFromFile.board.token);
  await configStep.fillAndVerifySourceControlForm(modifiedCorrectProjectFromFile.sourceControl);
  await configStep.fillAndVerifyPipelineToolForm(modifiedCorrectProjectFromFile.pipelineTool);

  await configStep.goToMetrics();

  await metricsStep.checkBoardNoCard();
  await metricsStep.checkPipelineFillNoStep(importUnhappyPathProjectFromFile.deployment);
  await metricsStep.goToPreviousStep();
  await configStep.typeInDateRange(dateRange);
  await configStep.goToMetrics();

  await metricsStep.checkCrews(importUnhappyPathProjectFromFile.crews);
  await metricsStep.checkNoCrewsReminder();
  await metricsStep.checkLastAssigneeCrewFilterChecked();
  await metricsStep.checkCycleTimeSettingIsByColumn();
  await metricsStep.checkHeartbeatStateIsSet(hbStateData, true);
  await metricsStep.checkClassifications(importUnhappyPathProjectFromFile.classification);
  await metricsStep.checkClassificationCharts(importUnhappyPathProjectFromFile.classificationCharts);
  await metricsStep.checkPipelineConfigurationAreChanged(importUnhappyPathProjectFromFile.deployment);
  await metricsStep.selectCrews(modifiedCorrectProjectFromFile.crews);
  await metricsStep.selectDoneHeartbeatState(ModifiedhbStateData[6]);
  await metricsStep.removeSourceControl(0);
  await metricsStep.validateNextButtonNotClickable();
  await metricsStep.selectDoneHeartbeatState(hbStateData[6]);
  await metricsStep.selectGivenPipelineCrews(modifiedCorrectProjectFromFile.pipelineCrews);
  await metricsStep.selectReworkSettings(modifiedCorrectProjectFromFile.reworkTimesSettings);
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(BOARD_METRICS_RESULT);
  await reportStep.checkDoraMetrics({
    prLeadTime: DORA_METRICS_RESULT.PrLeadTime,
    pipelineLeadTime: DORA_METRICS_RESULT.PipelineLeadTime,
    totalLeadTime: DORA_METRICS_RESULT.TotalLeadTime,
    deploymentFrequency: DORA_METRICS_RESULT.DeploymentFrequency,
    failureRate: DORA_METRICS_RESULT.FailureRate,
    pipelineMeanTimeToRecovery: DORA_METRICS_RESULT.DevMeanTimeToRecovery,
    deploymentTimes: DORA_METRICS_RESULT.DeploymentTimes,
  });
});
