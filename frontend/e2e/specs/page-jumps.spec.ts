import {
  config as metricsStepData,
  modifiedConfig as modifiedMetricsStepData,
} from '../fixtures/createNew/metricsStep';
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
  const modifiedHbStateData = modifiedMetricsStepData.cycleTime.jiraColumns.map(
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

  // 从metric页面回到config,再回到metrics页面
  await metricsStep.goToPreviousStep();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.waitForHiddenLoading();

  // todo wait to delete when ADM-821 is done
  await metricsStep.selectCycleTimeSettingsType(metricsStepData.cycleTime.type);
  await metricsStep.selectHeartbeatState(hbStateData);
  await metricsStep.selectClassifications(metricsStepData.classification);

  // 验证回退后，页面数据还在
  await metricsStep.checkCrews(metricsStepData.crews);
  await metricsStep.checkBoardByColumnRadioBoxChecked();
  await metricsStep.checkClassifications(metricsStepData.classification);

  // 修改board数据，进到report页面再回到metrics，验证数据正常
  await metricsStep.selectCrews(modifiedMetricsStepData.crews);
  await metricsStep.selectCycleTimeSettingsType(modifiedMetricsStepData.cycleTime.type);
  await metricsStep.selectModifiedHeartbeatState(modifiedHbStateData);
  await metricsStep.selectClassifications(modifiedMetricsStepData.classification);
  await metricsStep.goToReportPage();
  await reportStep.goToPreviousStep();
  await metricsStep.checkCrews(modifiedMetricsStepData.crews);
  await metricsStep.checkBoardByStatusRadioBoxChecked();
  await metricsStep.checkClassifications(modifiedMetricsStepData.classification);

  //修改pipeline数据，回到config页面再回到metrics，验证数据正常
  await metricsStep.selectDefaultGivenPipelineSetting(modifiedMetricsStepData.deployment);
  await metricsStep.selectGivenPipelineCrews(modifiedMetricsStepData.pipelineCrews);
  await metricsStep.goToPreviousStep();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.waitForHiddenLoading();
  // todo delete
  await metricsStep.selectGivenPipelineCrews(modifiedMetricsStepData.pipelineCrews);
  // await metricsStep.checkStepName('Deploy e2e');
  await metricsStep.checkPipelineCrews(modifiedMetricsStepData.pipelineCrews);

  //回退，回退，点击yes，回到主页
  await metricsStep.goToPreviousStep();
  await configStep.clickPreviousButtonThenGoHome();
});
