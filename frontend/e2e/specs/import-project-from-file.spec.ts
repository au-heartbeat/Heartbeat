import { importMultipleDoneProjectFromFile } from '../fixtures/importFile/multiple-done-config-file';
import { config as metricsStepData } from '../fixtures/createNew/metricsStep';
import { test } from '../fixtures/testWithExtendFixtures';
import { clearTempDir } from 'e2e/utils/clearTempDir';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Import project from file', async ({ homePage, configStep, metricsStep, reportStep }) => {
  await homePage.goto();
  await homePage.importMultipleDoneProjectFromFile();
  await configStep.clickPreviousButtonAndClickCancelThenRemainPage();
  await configStep.verifyAllConfig();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();

  await metricsStep.goToPreviousStep();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();

  // Make changes to Metrics page data
  await metricsStep.selectCrews(importMultipleDoneProjectFromFile.crews);
  await metricsStep.selectDefaultGivenPipelineSetting(metricsStepData.deployment);

  // Go to config page then next to metrics page, metrics data should stay changed
  await metricsStep.goToPreviousStep();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.checkCrewsAreChanged(importMultipleDoneProjectFromFile.crews);
  await metricsStep.checkPipelineConfigurationAreChanged();

  // Go to report page then back to metrics page, metrics data should stay changed
  await metricsStep.goToReportPage();
  await reportStep.goToPreviousStep();
  await metricsStep.checkCrewsAreChanged(importMultipleDoneProjectFromFile.crews);
  await metricsStep.checkPipelineConfigurationAreChanged();

  // Set metrics data to imported json file
  await metricsStep.selectCrews(importMultipleDoneProjectFromFile.crews);
  await metricsStep.selectDefaultGivenPipelineSetting(importMultipleDoneProjectFromFile.deployment);

  await metricsStep.goToReportPage();
  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics('17', '9', '4.86', '9.18');

  await reportStep.clickHomeIconThenBackToHomepage();
  await homePage.importFlagAsBlockProjectFromFile();
  await configStep.verifyBoardConfig();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();
  await metricsStep.goToReportPage();

  await reportStep.confirmGeneratedReport();
  await reportStep.checkBoardMetrics('17', '9', '4.86', '9.18');
  await reportStep.checkBoardMetricsDetails('import-project-from-file-Board-Metrics.png', 9);
  await reportStep.checkDoraMetrics('6.12', '0.50', '6.62', '6.60', '17.50% (7/40)', '1.90');
  await reportStep.checkDoraMetricsDetails('import-project-from-file-DORA-Metrics.png');

  await reportStep.checkDownloadReports();
});
