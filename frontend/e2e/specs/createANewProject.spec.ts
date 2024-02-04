import { test } from '../fixtures/testWithExtendFixtures';

test('Create a new project', async ({ homePage, configStep }) => {
  await homePage.goto();
  await homePage.createANewProject();

  await configStep.waitForShown();
});
