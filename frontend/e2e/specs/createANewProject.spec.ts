import { config as configStepData } from '../fixtures/configStep';
import { test } from '../fixtures/testWithExtendFixtures';
import dayjs from 'dayjs';

test('Create a new project', async ({ homePage, configStep }) => {
  const dateRange = {
    startDate: dayjs(configStepData.dateRange.startDate).format('MM/DD/YYYY'),
    endDate: dayjs(configStepData.dateRange.endDate).format('MM/DD/YYYY'),
  };

  await homePage.goto();
  await homePage.createANewProject();
  await configStep.waitForShown();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.clickPreviousButtonThenGoHome();
  await homePage.createANewProject();
  await configStep.typeInProjectName(configStepData.projectName);
  await configStep.typeInDateRange(dateRange);
  await configStep.validateNextButtonNotClickable();
  await configStep.selectAllRequiredMetrics();
  await configStep.checkBoardFormVisible();
  await configStep.checkPipelineToolFormVisible();
  await configStep.checkSourceControlFormVisible();
  await configStep.fillAndverifyBoardConfig(configStepData.board);
  await configStep.resetBoardConfig();
  await configStep.fillAndverifyBoardConfig(configStepData.board);
  await configStep.fillAndVerifyPipelineToolForm(configStepData.pipelineTool);
  await configStep.fillAndVerifySourceControlForm(configStepData.sourceControl);
  await configStep.saveConfigStepAsJSONThenVerifyDownloadFile(configStepData);
});
