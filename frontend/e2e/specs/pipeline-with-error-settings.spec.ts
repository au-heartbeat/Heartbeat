import { test } from '../fixtures/testWithExtendFixtures';
import { clearTempDir } from 'e2e/utils/clearTempDir';

test.beforeAll(async () => {
  await clearTempDir();
});

test('Check error UI for pipeline settings', async ({ homePage, configStep, metricsStep }) => {
  await homePage.goto();

  await homePage.importProjectFromFile('../fixtures/input-files/pipeline-error-config-file.json');
  await configStep.verifyAllConfig();
  await configStep.goToMetrics();
  await metricsStep.waitForShown();

  await metricsStep.checkErrorMessageForPipelineSettings();
});
