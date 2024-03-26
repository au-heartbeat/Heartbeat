import {
  importInputWrongProjectFromFile as importUnhappyPathProjectFromFile,
  importModifiedRightConfig as modifiedRightProjectFromFile,
} from '../fixtures/importFile/unhappy-path-file';
import { BOARD_METRICS_RESULT, DORA_METRICS_RESULT } from '../fixtures/createNew/reportResult';
import { test } from '../fixtures/testWithExtendFixtures';
import { clearTempDir } from 'e2e/utils/clearTempDir';
import { format } from '../utils/dateTime';

test.beforeAll(async () => {
  await clearTempDir();
});

test('unhappy path when import', async ({ homePage, configStep, metricsStep, reportStep }) => {
  const dateRange = {
    startDate: format(modifiedRightProjectFromFile.dateRange.startDate),
    endDate: format(modifiedRightProjectFromFile.dateRange.endDate),
  };

  const hbStateData = importUnhappyPathProjectFromFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  const ModifiedhbStateData = modifiedRightProjectFromFile.cycleTime.jiraColumns.map(
    (jiraToHBSingleMap) => Object.values(jiraToHBSingleMap)[0],
  );

  await homePage.goto();

  await homePage.importInputWrongProjectFromFile();
  await configStep.remindImportedDataNotmatched();
  await configStep.checkProjectName(importUnhappyPathProjectFromFile.projectName);
  await configStep.verifyAllConfig();
  await configStep.verifyAllConfigInvalid();
  await configStep.validateNextButtonNotClickable();
  await configStep.typeInProjectName(modifiedRightProjectFromFile.projectName);
  await configStep.fillAndverifyBoardConfig(modifiedRightProjectFromFile.board);
  await configStep.fillAndVerifySourceControlForm(modifiedRightProjectFromFile.sourceControl);
  await configStep.fillAndVerifyPipelineToolForm(modifiedRightProjectFromFile.pipelineTool);

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
  await metricsStep.checkHeartbeatStateIsSet(hbStateData);
  await metricsStep.checkClassifications(importUnhappyPathProjectFromFile.classification);
  await metricsStep.checkPipelineConfigurationAreChanged(importUnhappyPathProjectFromFile.deployment);
  await metricsStep.checkBranchIsInvalid();
  await metricsStep.selectCrews(modifiedRightProjectFromFile.crews);
  await metricsStep.deselectBranch(modifiedRightProjectFromFile.deletedBranch);
  //*问题*：页面有多个相同的元素，如多个pipeline settings，定位到new pipeline, 需要抽象locator
  await metricsStep.addNewPipelineAndSelectSamePipeline(importUnhappyPathProjectFromFile.deployment); //*优化*：定位到新的pipeline的locator优化
  await metricsStep.RemoveNewPipeline(); //*优化*：定位到新的pipeline的locator优化
  await metricsStep.selectDoneHeartbeatState(ModifiedhbStateData[6]);
  await metricsStep.validateNextButtonNotClickable();
  await metricsStep.selectDoneHeartbeatState(hbStateData[6]);
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics(
    BOARD_METRICS_RESULT.Velocity,
    BOARD_METRICS_RESULT.Throughput,
    BOARD_METRICS_RESULT.AverageCycleTime4SP,
    BOARD_METRICS_RESULT.AverageCycleTime4Card,
  );
  await reportStep.checkDoraMetrics(
    DORA_METRICS_RESULT.PrLeadTime,
    DORA_METRICS_RESULT.PipelineLeadTime,
    DORA_METRICS_RESULT.TotalLeadTime,
    DORA_METRICS_RESULT.DeploymentFrequency,
    DORA_METRICS_RESULT.FailureRate,
    DORA_METRICS_RESULT.DevMeanTimeToRecovery,
  );
});
