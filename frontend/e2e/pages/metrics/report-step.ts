import {
  IBoardMetricsDetailItem,
  IBoardMetricsResult,
  IBoardCycletimeDetailItem,
  IBoardClassificationDetailItem,
} from '../../fixtures/create-new/report-result';
import {
  checkDownloadReport,
  checkDownloadReportCycleTimeByStatus,
  checkDownloadWithHolidayReport,
  downloadFileAndCheck,
} from 'e2e/utils/download';
import {
  ICsvComparedLines,
  IDoraMetricsResultItem,
  DORA_METRICS_RESULT_MULTIPLE_RANGES,
} from '../../fixtures/create-new/report-result';
import { BOARD_CHART_VALUE, DORA_CHART_VALUE } from '../../fixtures/import-file/chart-result';
import { DOWNLOAD_EVENTS_WAIT_THRESHOLD } from '../../fixtures/index';
import { expect, Locator, Page, Download } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import path from 'path';
import fs from 'fs';

export enum ProjectCreationType {
  IMPORT_PROJECT_FROM_FILE,
  CREATE_A_NEW_PROJECT,
}

export class ReportStep {
  readonly page: Page;
  readonly pageHeader: Locator;
  readonly projectName: Locator;
  readonly dateRangeViewerContainer: Locator;
  readonly dateRangeViewerExpandTrigger: Locator;
  readonly dateRangeViewerOptions: Locator;
  readonly velocityPart: Locator;
  readonly averageCycleTimeForSP: Locator;
  readonly averageCycleTimeForCard: Locator;
  readonly boardMetricRework: Locator;
  readonly boardMetricsDetailVelocityPart: Locator;
  readonly boardMetricsDetailCycleTimePart: Locator;
  readonly boardMetricsDetailClassificationPart: Locator;
  readonly boardMetricsDetailReworkTimesPart: Locator;
  readonly prLeadTime: Locator;
  readonly pipelineLeadTime: Locator;
  readonly totalLeadTime: Locator;
  readonly deploymentFrequency: Locator;
  readonly failureRate: Locator;
  readonly pipelineMeanTimeToRecovery: Locator;
  readonly showMoreLinks: Locator;
  readonly previousButton: Locator;
  readonly backButton: Locator;
  readonly exportPipelineDataButton: Locator;
  readonly exportBoardData: Locator;
  readonly exportMetricData: Locator;
  readonly homeIcon: Locator;
  readonly shareReportIcon: Locator;
  readonly shareReportPopper: Locator;
  readonly shareReportCopyLink: Locator;
  readonly shareReportSuccessAlert: Locator;
  readonly velocityRows: Locator;
  readonly cycleTimeRows: Locator;
  readonly classificationRows: Locator;
  readonly leadTimeForChangesRows: Locator;
  readonly pipelineChangeFailureRateRows: Locator;
  readonly deploymentFrequencyRows: Locator;
  readonly pipelineMeanTimeToRecoveryRows: Locator;
  readonly reworkRows: Locator;
  readonly downloadDialog: Locator;
  readonly displayTabsContainer: Locator;
  readonly displayListTab: Locator;
  readonly displayChartTab: Locator;
  readonly chartTabsContainer: Locator;
  readonly displayBoardChartTab: Locator;
  readonly displayDoraChartTab: Locator;
  readonly velocityChart: Locator;
  readonly cycleTimeChart: Locator;
  readonly cycleTimeAllocationChart: Locator;
  readonly reworkChart: Locator;
  readonly classificationIssueTypeChart: Locator;
  readonly classificationAssigneeChart: Locator;
  readonly leadTimeForChangeChart: Locator;
  readonly deploymentFrequencyChart: Locator;
  readonly changeFailureRateChart: Locator;
  readonly meanTimeToRecoveryChart: Locator;
  readonly velocityLoading: Locator;
  readonly cycleTimeLoading: Locator;
  readonly cycleTimeAllocationLoading: Locator;
  readonly reworkLoading: Locator;
  readonly leadTimeForChangeLoading: Locator;
  readonly deploymentFrequencyLoading: Locator;
  readonly changeFailureRateLoading: Locator;
  readonly meanTimeToRecoveryLoading: Locator;
  readonly velocityTrendContainer: Locator;
  readonly reworkTrendContainer: Locator;
  readonly cycleTimeAllocationTrendContainer: Locator;
  readonly cycleTimeTrendContainer: Locator;
  readonly velocityTrendIcon: Locator;
  readonly reworkTrendIcon: Locator;
  readonly cycleTimeAllocationTrendIcon: Locator;
  readonly cycleTimeTrendIcon: Locator;
  readonly doraPipelineSelector: Locator;
  readonly pipelineMeanTimeToRecoveryTrendContainer: Locator;
  readonly pipelineChangeFailureRateTrendContainer: Locator;
  readonly deploymentFrequencyTrendContainer: Locator;
  readonly leadTimeForChangesTrendContainer: Locator;
  readonly pipelineMeanTimeToRecoveryTrendIcon: Locator;
  readonly pipelineChangeFailureRateTrendIcon: Locator;
  readonly deploymentFrequencyTrendIcon: Locator;
  readonly leadTimeForChangesTrendIcon: Locator;
  readonly classificationIssueTypeChartSwitchIcon: Locator;
  readonly classificationAssigneeChartSwitchIcon: Locator;

  readonly leadTimeForChangesExplanationIcon: Locator;
  readonly deploymentFrequencyExplanationIcon: Locator;
  readonly pipelineChangeFailureRateExplanationIcon: Locator;
  readonly pipelineMeanTimeToRecoveryExplanationIcon: Locator;

  readonly doraMetricsDialog: Locator;
  readonly doraMetricsDialogContainer: Locator;
  readonly doraMetricsDialogClose: Locator;
  readonly doraMetricsDialogDefinition: Locator;
  readonly doraMetricsDialogInfluencedFactors: Locator;
  readonly doraMetricsDialogFormula: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = this.page.locator('[data-test-id="Header"]');
    this.projectName = this.page.getByLabel('project name');
    this.dateRangeViewerContainer = this.page.getByLabel('date range viewer');
    this.dateRangeViewerExpandTrigger = this.dateRangeViewerContainer.getByLabel('expandMore');
    this.dateRangeViewerOptions = this.dateRangeViewerContainer.getByLabel('date range viewer options');
    this.velocityPart = this.page.locator('[data-test-id="Velocity"] [data-test-id="report-section"]');
    this.averageCycleTimeForSP = this.page.locator('[data-test-id="Cycle Time"] [data-test-id="report-section"]');
    this.averageCycleTimeForCard = this.page.locator('[data-test-id="Cycle Time"] [data-test-id="report-section"]');
    this.boardMetricRework = this.page.locator('[data-test-id="Rework"] [data-test-id="report-section"]');
    this.boardMetricsDetailVelocityPart = this.page.locator('[data-test-id="Velocity"]');
    this.boardMetricsDetailCycleTimePart = this.page.locator('[data-test-id="Cycle Time"]');
    this.boardMetricsDetailClassificationPart = this.page.locator('[data-test-id="Classification"]');
    this.boardMetricsDetailReworkTimesPart = this.page.locator('[data-test-id="Rework"]');

    this.prLeadTime = this.page.locator('[data-test-id="Lead Time For Changes"] [data-test-id="report-section"]');
    this.pipelineLeadTime = this.page.locator('[data-test-id="Lead Time For Changes"] [data-test-id="report-section"]');
    this.totalLeadTime = this.page.locator('[data-test-id="Lead Time For Changes"] [data-test-id="report-section"]');
    this.deploymentFrequency = this.page.locator(
      '[data-test-id="Deployment Frequency"] [data-test-id="report-section"]',
    );
    this.failureRate = this.page.locator(
      '[data-test-id="Pipeline Change Failure Rate"] [data-test-id="report-section"]',
    );
    this.pipelineMeanTimeToRecovery = this.page.locator(
      '[data-test-id="Pipeline Mean Time To Recovery"] [data-test-id="report-section"]',
    );
    this.showMoreLinks = this.page.getByText('show more >');
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.backButton = this.page.getByText('Back');
    this.exportMetricData = this.page.getByText('Export metric data');
    this.exportBoardData = this.page.getByText('Export board data');
    this.exportPipelineDataButton = this.page.getByText('Export pipeline data');
    this.homeIcon = page.getByLabel('Home');
    this.shareReportIcon = page.getByLabel('Share Report');
    this.shareReportPopper = page.getByLabel('Share Report Popper');
    this.shareReportCopyLink = page.getByLabel('Copy Link');
    this.shareReportSuccessAlert = page.getByText('Link copied to clipboard');
    this.velocityRows = this.page.getByTestId('Velocity').locator('tbody').getByRole('row');
    this.cycleTimeRows = this.page.getByTestId('Cycle Time').locator('tbody').getByRole('row');
    this.deploymentFrequencyRows = this.page.getByLabel('Deployment Frequency').locator('tbody').getByRole('row');
    this.classificationRows = this.page.getByTestId('Classification').locator('tbody').getByRole('row');
    this.leadTimeForChangesRows = this.page.getByTestId('Lead Time For Changes').getByRole('row');
    this.pipelineChangeFailureRateRows = this.page
      .getByTestId('Pipeline Change Failure Rate')
      .locator('tbody')
      .getByRole('row');
    this.pipelineMeanTimeToRecoveryRows = this.page
      .getByTestId('Pipeline Mean Time To Recovery')
      .locator('tbody')
      .getByRole('row');
    this.reworkRows = this.page.getByTestId('Rework').getByRole('row');
    this.downloadDialog = this.page.getByLabel('download file dialog');
    this.displayTabsContainer = this.page.getByLabel('display types');
    this.displayListTab = this.displayTabsContainer.getByLabel('display list tab');
    this.displayChartTab = this.displayTabsContainer.getByLabel('display chart tab');
    this.chartTabsContainer = this.page.getByLabel('chart tabs');
    this.displayBoardChartTab = this.chartTabsContainer.getByLabel('board chart');
    this.displayDoraChartTab = this.chartTabsContainer.getByLabel('dora chart');
    this.velocityChart = this.page.getByLabel('velocity chart');
    this.cycleTimeChart = this.page.getByLabel('cycle time chart');
    this.cycleTimeAllocationChart = this.page.getByLabel('cycle time allocation chart');
    this.reworkChart = this.page.getByLabel('rework chart');
    this.classificationIssueTypeChart = this.page.getByLabel('classification issue type chart');
    this.classificationAssigneeChart = this.page.getByLabel('classification assignee chart');
    this.leadTimeForChangeChart = this.page.getByLabel('lead time for changes chart');
    this.deploymentFrequencyChart = this.page.getByLabel('deployment frequency chart');
    this.changeFailureRateChart = this.page.getByLabel('change failure rate chart');
    this.meanTimeToRecoveryChart = this.page.getByLabel('mean time to recovery chart');
    this.velocityLoading = this.page.getByLabel('velocity loading');
    this.cycleTimeLoading = this.page.getByLabel('cycle time loading');
    this.cycleTimeAllocationLoading = this.page.getByLabel('cycle time allocation loading');
    this.reworkLoading = this.page.getByLabel('rework loading');
    this.leadTimeForChangeLoading = this.page.getByLabel('lead time for changes loading');
    this.deploymentFrequencyLoading = this.page.getByLabel('deployment frequency loading');
    this.changeFailureRateLoading = this.page.getByLabel('change failure rate loading');
    this.meanTimeToRecoveryLoading = this.page.getByLabel('mean time to recovery loading');
    this.velocityTrendContainer = this.page.getByLabel('velocity trend container');
    this.cycleTimeTrendContainer = this.page.getByLabel('cycle time trend container');
    this.cycleTimeAllocationTrendContainer = this.page.getByLabel('cycle time allocation trend container');
    this.reworkTrendContainer = this.page.getByLabel('rework trend container');
    this.velocityTrendIcon = this.velocityTrendContainer.getByLabel('trend down');
    this.cycleTimeTrendIcon = this.cycleTimeTrendContainer.getByLabel('trend down');
    this.cycleTimeAllocationTrendIcon = this.cycleTimeAllocationTrendContainer.getByLabel('trend down');
    this.reworkTrendIcon = this.reworkTrendContainer.getByLabel('trend down');

    this.classificationIssueTypeChartSwitchIcon = this.page.getByLabel('classification issue type switch chart');
    this.classificationAssigneeChartSwitchIcon = this.page.getByLabel('classification assignee switch chart');

    this.doraPipelineSelector = this.page.getByLabel('Pipeline Selector').first();
    this.leadTimeForChangesTrendContainer = this.page.getByLabel('lead time for changes trend container');
    this.deploymentFrequencyTrendContainer = this.page.getByLabel('deployment frequency trend container');
    this.pipelineChangeFailureRateTrendContainer = this.page.getByLabel('pipeline change failure rate trend container');
    this.pipelineMeanTimeToRecoveryTrendContainer = this.page.getByLabel(
      'pipeline mean time to recovery trend container',
    );
    this.leadTimeForChangesTrendIcon = this.leadTimeForChangesTrendContainer.getByLabel('trend down');
    this.deploymentFrequencyTrendIcon = this.deploymentFrequencyTrendContainer.getByLabel('trend down');
    this.pipelineChangeFailureRateTrendIcon = this.pipelineChangeFailureRateTrendContainer.getByLabel('trend down');
    this.pipelineMeanTimeToRecoveryTrendIcon = this.pipelineMeanTimeToRecoveryTrendContainer.getByLabel('trend down');

    this.leadTimeForChangesExplanationIcon = this.page.getByLabel('lead time for changes explanation');
    this.deploymentFrequencyExplanationIcon = this.page.getByLabel('deployment frequency explanation');
    this.pipelineChangeFailureRateExplanationIcon = this.page.getByLabel('pipeline change failure rate explanation');
    this.pipelineMeanTimeToRecoveryExplanationIcon = this.page.getByLabel('pipeline mean time to recovery explanation');

    this.doraMetricsDialog = this.page.getByLabel('dora metrics dialog').nth(0);
    this.doraMetricsDialogContainer = this.doraMetricsDialog.getByLabel('dora metrics dialog container');
    this.doraMetricsDialogClose = this.doraMetricsDialog.getByLabel('close');
    this.doraMetricsDialogDefinition = this.doraMetricsDialog.getByLabel('definition');
    this.doraMetricsDialogInfluencedFactors = this.doraMetricsDialog.getByLabel('influenced factors');
    this.doraMetricsDialogFormula = this.doraMetricsDialog.getByLabel('formula');
  }
  combineStrings(arr: string[]): string {
    return arr.join('');
  }

  async clickShowMoreLink() {
    await this.showMoreLinks.click();
  }

  async goToPreviousStep() {
    await this.previousButton.click();
  }

  async checkProjectName(projectName: string) {
    await expect(this.projectName).toContainText(projectName);
  }

  async checkDoraMetricsReportDetails(doraMetricsDetailData: IDoraMetricsResultItem) {
    await expect(this.deploymentFrequencyRows.getByRole('cell').nth(0)).toContainText('Heartbeat/ Deploy prod');
    await expect(this.deploymentFrequencyRows.getByRole('cell').nth(1)).toContainText(
      doraMetricsDetailData.deploymentFrequency,
    );
    await expect(this.deploymentFrequencyRows.getByRole('cell').nth(2)).toContainText(
      doraMetricsDetailData.deploymentTimes,
    );

    await expect(this.leadTimeForChangesRows.nth(2)).toContainText(
      this.combineStrings(['PR Lead Time', doraMetricsDetailData.prLeadTime]),
    );
    await expect(this.leadTimeForChangesRows.nth(3)).toContainText(
      this.combineStrings(['Pipeline Lead Time', doraMetricsDetailData.pipelineLeadTime]),
    );
    await expect(this.leadTimeForChangesRows.nth(4)).toContainText(
      this.combineStrings(['Total Lead Time', doraMetricsDetailData.totalLeadTime]),
    );

    await expect(this.pipelineChangeFailureRateRows.getByRole('cell').nth(0)).toContainText('Heartbeat/ Deploy prod');
    await expect(this.pipelineChangeFailureRateRows.getByRole('cell').nth(1)).toContainText(
      doraMetricsDetailData.failureRate.replace(' ', ''),
    );
    await expect(this.pipelineMeanTimeToRecoveryRows.getByRole('cell').nth(0)).toContainText('Heartbeat/ Deploy prod');
    await expect(this.pipelineMeanTimeToRecoveryRows.getByRole('cell').nth(1)).toContainText(
      doraMetricsDetailData.pipelineMeanTimeToRecovery,
    );
  }

  async checkDoraMetricsReportDetailsForMultipleRanges(doraMetricsReportData: IDoraMetricsResultItem[]) {
    for (let i = 0; i < doraMetricsReportData.length; i++) {
      await this.changeTimeRange(i);
      await this.checkDoraMetricsReportDetails(doraMetricsReportData[i]);
    }
  }

  async checkDoraMetricsDetailsForMultipleRanges({
    projectCreationType,
    doraMetricsReportData,
  }: {
    projectCreationType: ProjectCreationType;
    doraMetricsReportData: IDoraMetricsResultItem[];
  }) {
    await this.showMoreLinks.nth(1).click();
    if (
      projectCreationType === ProjectCreationType.IMPORT_PROJECT_FROM_FILE ||
      projectCreationType === ProjectCreationType.CREATE_A_NEW_PROJECT
    ) {
      await this.checkDoraMetricsReportDetailsForMultipleRanges(doraMetricsReportData);
    } else {
      throw Error('The board detail type is not correct, please give a correct one.');
    }

    await this.downloadFileAndCheckForMultipleRanges({
      trigger: this.exportPipelineDataButton,
      rangeCount: DORA_METRICS_RESULT_MULTIPLE_RANGES.length,
    });

    await this.backButton.click();
  }

  async confirmGeneratedReport() {
    await expect(this.page.getByRole('alert').first()).toContainText('Help Information');
    await expect(this.page.getByRole('alert').first()).toContainText(
      'The files will be cleaned up irregularly, please download promptly to avoid expiration.',
    );
  }

  async checkShareReport() {
    // await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await expect(this.shareReportIcon).toHaveCSS('cursor', 'pointer');
    await this.shareReportIcon.click();
    await expect(this.shareReportPopper).toBeVisible();
    await this.shareReportCopyLink.click();
    await expect(this.shareReportSuccessAlert).toBeVisible();

    // const handle = await this.page.evaluateHandle(() => navigator.clipboard.readText());
    // const host = await this.page.evaluate(() => document.location.host);
    // const clipboardContent = await handle.jsonValue();
    // expect(clipboardContent.startsWith(host + '/reports')).toBeTruthy();

    // const shareReportPage = await context.newPage();
    // await shareReportPage.goto(clipboardContent);
    // await expect(shareReportPage.getByLabel('Home')).toBeVisible();
    // await expect(shareReportPage.getByText('Board Metrics')).toBeVisible();
    // await expect(shareReportPage.getByLabel('Share Report')).not.toBeVisible();
    // await expect(shareReportPage.getByText('Back')).not.toBeVisible();
    // await expect(shareReportPage.getByText('Export metric data')).not.toBeVisible();
    // await expect(shareReportPage.getByText('Export board data')).not.toBeVisible();
    // await expect(shareReportPage.getByText('Export pipeline data')).not.toBeVisible();

    // await shareReportPage.close();
  }

  async checkBoardMetricsWithoutRework(
    velocity: string,
    throughPut: string,
    averageCycleTimeForSP: string,
    averageCycleTimeForCard: string,
  ) {
    await expect(this.velocityPart).toContainText(`${velocity}Velocity(Story Point)`);
    await expect(this.velocityPart).toContainText(`${throughPut}Throughput(Cards Count)`);
    await expect(this.averageCycleTimeForSP).toContainText(`${averageCycleTimeForSP}Average Cycle Time(Days/SP)`);
    await expect(this.averageCycleTimeForCard).toContainText(`${averageCycleTimeForCard}Average Cycle Time(Days/Card)`);
  }

  async checkBoardMetrics({
    velocity,
    throughput,
    averageCycleTimeForSP,
    averageCycleTimeForCard,
    totalReworkTimes,
    totalReworkCards,
    reworkCardsRatio,
    reworkThroughput,
  }: IBoardMetricsResult) {
    await expect(this.velocityPart).toContainText(`${velocity}Velocity(Story Point)`);
    await expect(this.velocityPart).toContainText(`${throughput}Throughput(Cards Count)`);
    await expect(this.averageCycleTimeForSP).toContainText(`${averageCycleTimeForSP}Average Cycle Time(Days/SP)`);
    await expect(this.averageCycleTimeForCard).toContainText(`${averageCycleTimeForCard}Average Cycle Time(Days/Card)`);
    await expect(this.boardMetricRework).toContainText(`${totalReworkTimes}Total rework times`);
    await expect(this.boardMetricRework).toContainText(`${totalReworkCards}Total rework cards`);
    await expect(this.boardMetricRework).toContainText(
      `${(Number(reworkCardsRatio) * 100).toFixed(2)}% (${totalReworkCards}/${reworkThroughput})Rework cards ratio`,
    );
  }

  async changeTimeRange(index: number) {
    await this.dateRangeViewerExpandTrigger.click();
    await expect(this.dateRangeViewerOptions).toBeVisible();
    const currentRange = this.dateRangeViewerOptions.getByLabel(`date range viewer - option ${index}`);
    await currentRange.click();
  }

  async checkBoardMetricsForMultipleRanges(data: IBoardMetricsResult[]) {
    for (let i = 0; i < data.length; i++) {
      await this.changeTimeRange(i);
      await this.checkBoardMetrics(data[i]);
    }
  }

  async checkVelocityDetail(velocityData: IBoardMetricsDetailItem[]) {
    await expect(this.velocityRows.filter({ hasText: velocityData[0].name }).getByRole('cell').nth(1)).toContainText(
      velocityData[0].value,
    );
    await expect(this.velocityRows.filter({ hasText: velocityData[1].name }).getByRole('cell').nth(1)).toContainText(
      velocityData[1].value,
    );
  }

  async checkVelocityDetailForMultipleRanges(data: IBoardMetricsDetailItem[][]) {
    for (let i = 0; i < data.length; i++) {
      await this.changeTimeRange(i);
      await this.checkVelocityDetail(data[i]);
    }
  }

  async checkCycleTimeDetail(cycleTimeData: IBoardCycletimeDetailItem[]) {
    for (let i = 0; i < cycleTimeData.length; i++) {
      const currentMetric = cycleTimeData[i];
      let currentRow = this.cycleTimeRows.filter({ hasText: currentMetric.name });
      const restLines = [...currentMetric.lines];
      const firstLineValue = restLines.shift();
      expect(await currentRow.getByRole('cell').nth(1).innerHTML()).toEqual(firstLineValue);
      while (restLines.length) {
        currentRow = currentRow.locator('+tr');
        const value = restLines.shift()!;
        expect(await currentRow.getByRole('cell').first().innerHTML()).toEqual(value);
      }
    }
  }

  async checkCycleTimeDetailForMultipleRanges(data: IBoardCycletimeDetailItem[][]) {
    for (let i = 0; i < data.length; i++) {
      await this.changeTimeRange(i);
      await this.checkCycleTimeDetail(data[i]);
    }
  }

  async checkClassificationDetail(classificationData: IBoardClassificationDetailItem[]) {
    for (let i = 0; i < classificationData.length; i++) {
      const currentMetric = classificationData[i];
      const nameRow = this.classificationRows.filter({ hasText: currentMetric.name });
      let currentDataRow = nameRow.locator('+tr');
      const restLines = [...currentMetric.lines];
      while (restLines.length) {
        if (restLines.length < currentMetric.lines.length) {
          currentDataRow = currentDataRow.locator('+tr');
        }
        const [subtitle, value] = restLines.shift()!;
        expect(await currentDataRow.getByRole('cell').first().innerHTML()).toEqual(subtitle);
        expect(await currentDataRow.getByRole('cell').nth(1).innerHTML()).toEqual(value);
      }
    }
  }

  async checkClassificationDetailForMultipleRanges(data: IBoardClassificationDetailItem[][]) {
    for (let i = 0; i < data.length; i++) {
      await this.changeTimeRange(i);
      await this.checkClassificationDetail(data[i]);
    }
  }

  async checkReworkDetail(reworkData: IBoardMetricsDetailItem[]) {
    await expect(this.reworkRows.filter({ hasText: reworkData[0].name }).getByRole('cell').nth(1)).toContainText(
      reworkData[0].value,
    );
    await expect(this.reworkRows.filter({ hasText: reworkData[1].name }).getByRole('cell').nth(1)).toContainText(
      reworkData[1].value,
    );
  }

  async checkReworkDetailForMultipleRanges(data: IBoardMetricsDetailItem[][]) {
    for (let i = 0; i < data.length; i++) {
      await this.changeTimeRange(i);
      await this.checkReworkDetail(data[i]);
    }
  }

  async checkOnlyVelocityPartVisible() {
    await expect(this.boardMetricsDetailVelocityPart).toBeVisible();
    await expect(this.boardMetricsDetailCycleTimePart).toBeHidden();
    await expect(this.boardMetricsDetailClassificationPart).toBeHidden();
    await expect(this.boardMetricsDetailReworkTimesPart).toBeHidden();
  }

  async checkOnlyCycleTimePartVisible() {
    await expect(this.boardMetricsDetailVelocityPart).toBeHidden();
    await expect(this.boardMetricsDetailCycleTimePart).toBeVisible();
    await expect(this.boardMetricsDetailClassificationPart).toBeHidden();
    await expect(this.boardMetricsDetailReworkTimesPart).toBeHidden();
  }

  async checkOnlyClassificationPartVisible() {
    await expect(this.boardMetricsDetailVelocityPart).toBeHidden();
    await expect(this.boardMetricsDetailCycleTimePart).toBeHidden();
    await expect(this.boardMetricsDetailClassificationPart).toBeVisible();
    await expect(this.boardMetricsDetailReworkTimesPart).toBeHidden();
  }

  async checkOnlyReworkTimesPartVisible() {
    await expect(this.boardMetricsDetailVelocityPart).toBeHidden();
    await expect(this.boardMetricsDetailCycleTimePart).toBeHidden();
    await expect(this.boardMetricsDetailClassificationPart).toBeHidden();
    await expect(this.boardMetricsDetailReworkTimesPart).toBeVisible();
  }

  async checkOnlyLeadTimeForChangesPartVisible() {
    await expect(this.totalLeadTime).toBeVisible();
    await expect(this.deploymentFrequency).toBeHidden();
    await expect(this.failureRate).toBeHidden();
    await expect(this.pipelineMeanTimeToRecovery).toBeHidden();
  }

  async checkOnlyDeploymentFrequencyPartVisible() {
    await expect(this.totalLeadTime).toBeHidden();
    await expect(this.deploymentFrequency).toBeVisible();
    await expect(this.failureRate).toBeHidden();
    await expect(this.pipelineMeanTimeToRecovery).toBeHidden();
  }

  async checkOnlyChangeFailureRatePartVisible() {
    await expect(this.totalLeadTime).toBeHidden();
    await expect(this.deploymentFrequency).toBeHidden();
    await expect(this.failureRate).toBeVisible();
    await expect(this.pipelineMeanTimeToRecovery).toBeHidden();
  }

  async checkOnlyMeanTimeToRecoveryPartVisible() {
    await expect(this.totalLeadTime).toBeHidden();
    await expect(this.deploymentFrequency).toBeHidden();
    await expect(this.failureRate).toBeHidden();
    await expect(this.pipelineMeanTimeToRecovery).toBeVisible();
  }

  async checkExportMetricDataButtonClickable() {
    await expect(this.exportMetricData).toBeEnabled();
  }

  async checkExportBoardDataButtonClickable() {
    await expect(this.exportBoardData).toBeEnabled();
  }

  async checkExportPipelineDataButtonClickable() {
    await expect(this.exportPipelineDataButton).toBeEnabled();
  }

  async checkBoardMetricsDetailsForMultipleRanges({
    projectCreationType,
    csvCompareLines,
    velocityData,
    cycleTimeData,
    classificationData,
    reworkData,
  }: {
    projectCreationType: ProjectCreationType;
    csvCompareLines: ICsvComparedLines;
    velocityData: IBoardMetricsDetailItem[][];
    cycleTimeData: IBoardCycletimeDetailItem[][];
    classificationData: IBoardClassificationDetailItem[][];
    reworkData: IBoardMetricsDetailItem[][];
  }) {
    await this.showMoreLinks.first().click();
    if (
      projectCreationType === ProjectCreationType.IMPORT_PROJECT_FROM_FILE ||
      projectCreationType === ProjectCreationType.CREATE_A_NEW_PROJECT
    ) {
      await this.checkVelocityDetailForMultipleRanges(velocityData);
      await this.checkCycleTimeDetailForMultipleRanges(cycleTimeData);
      await this.checkClassificationDetailForMultipleRanges(classificationData);
      await this.checkReworkDetailForMultipleRanges(reworkData);
    } else {
      throw Error('The board detail type is not correct, please give a correct one.');
    }

    await this.downloadFileAndCheckForMultipleRanges({
      trigger: this.exportBoardData,
      rangeCount: csvCompareLines.length,
      csvCompareLines,
    });
    await this.backButton.click();
  }

  async downloadFileAndCheckForMultipleRanges({
    trigger,
    rangeCount,
    csvCompareLines,
    fileNamePrefix,
  }: {
    trigger: Locator;
    rangeCount: number;
    csvCompareLines?: ICsvComparedLines;
    fileNamePrefix?: string;
  }) {
    const isNeedToCompareCsvLines = csvCompareLines !== undefined;
    const isRangesCountAndCsvCountEqual = isNeedToCompareCsvLines && rangeCount !== csvCompareLines.length;
    expect(isRangesCountAndCsvCountEqual).toEqual(false);
    await expect(trigger).toBeEnabled();
    await trigger.click();
    await expect(this.downloadDialog).toBeVisible();
    const rangeCheckboxes = await this.downloadDialog.getByRole('checkbox').all();
    for (let i = 0; i < rangeCheckboxes.length; i++) {
      await expect(rangeCheckboxes[i]).toBeEnabled();
      await rangeCheckboxes[i].check();
    }
    const confirmButton = this.downloadDialog.getByLabel('confirm download');
    await expect(confirmButton).toBeEnabled();
    const downloadEvents: Promise<Download>[] = [];
    this.page.on('download', async (data) => {
      downloadEvents.push(Promise.resolve(data));
    });
    let waitCounter = 0;
    await confirmButton.click();
    while (downloadEvents.length < rangeCount && waitCounter < DOWNLOAD_EVENTS_WAIT_THRESHOLD) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          waitCounter++;
          resolve();
        }, 1000);
      });
    }
    const downloads = await Promise.all(downloadEvents);
    for (let i = 0; i < downloads.length; i++) {
      const download = downloads[i];
      const fileName = download.suggestedFilename().split('-').slice(0, 3).join('-');
      const savePath = path.resolve(__dirname, '../../temp', `./${fileName}.csv`);
      await download.saveAs(savePath);
      const downloadPath = await download.path();
      const fileDataString = fs.readFileSync(downloadPath, 'utf8');
      const localCsvFile = fs.readFileSync(
        path.resolve(
          __dirname,
          '../../fixtures/create-new',
          `./${fileNamePrefix ? fileNamePrefix + fileName : fileName}.csv`,
        ),
      );
      const localCsv = parse(localCsvFile, { to: isNeedToCompareCsvLines ? csvCompareLines[fileName] : undefined });
      const downloadCsv = parse(fileDataString, {
        to: isNeedToCompareCsvLines ? csvCompareLines[fileName] : undefined,
      });

      expect(localCsv).toStrictEqual(downloadCsv);
      await download.delete();
    }
  }

  async checkBoardDownloadDataWithoutBlock(fileName: string, csvCompareLines?: number) {
    console.log(fileName);
    await downloadFileAndCheck(
      this.page,
      this.exportBoardData,
      'board-data-without-block-column.csv',
      async (fileDataString) => {
        const localCsvFile = fs.readFileSync(path.resolve(__dirname, fileName));
        const localCsv = parse(localCsvFile, {
          to: csvCompareLines,
        });
        const downloadCsv = parse(fileDataString, {
          to: csvCompareLines,
        });

        expect(localCsv).toStrictEqual(downloadCsv);
      },
    );
  }

  async checkBoardDownloadDataWithoutBlockForMultipleRanges(rangeCount: number) {
    await this.downloadFileAndCheckForMultipleRanges({ trigger: this.exportBoardData, rangeCount });
  }

  async checkDoraMetrics({
    prLeadTime,
    pipelineLeadTime,
    totalLeadTime,
    deploymentFrequency,
    failureRate,
    pipelineMeanTimeToRecovery,
    deploymentTimes,
  }: IDoraMetricsResultItem) {
    await expect(this.prLeadTime).toContainText(`${prLeadTime}PR Lead Time(Hours)`);
    await expect(this.pipelineLeadTime).toContainText(`${pipelineLeadTime}Pipeline Lead Time(Hours)`);
    await expect(this.totalLeadTime).toContainText(`${totalLeadTime}Total Lead Time(Hours)`);
    await expect(this.deploymentFrequency).toContainText(
      `${deploymentFrequency}Deployment Frequency(Times/Days)${deploymentTimes}Deployment Times(Times)`,
    );
    await expect(this.failureRate).toContainText(failureRate);
    await expect(this.pipelineMeanTimeToRecovery).toContainText(`${pipelineMeanTimeToRecovery}(Hours)`);
  }

  async checkDoraMetricsForMultipleRanges(data: IDoraMetricsResultItem[]) {
    for (let i = 0; i < data.length; i++) {
      await this.changeTimeRange(i);
      await this.checkDoraMetrics(data[i]);
    }
  }

  async checkMetricDownloadData() {
    await downloadFileAndCheck(this.page, this.exportMetricData, 'metricData.csv', async (fileDataString) => {
      const localCsvFile = fs.readFileSync(path.resolve(__dirname, '../../fixtures/create-new/metric-data.csv'));
      const localCsv = parse(localCsvFile);
      const downloadCsv = parse(fileDataString);

      expect(localCsv).toStrictEqual(downloadCsv);
    });
  }

  async checkMetricDownloadDataForMultipleRanges(rangeCount: number, fileNamePrefix?: string) {
    await this.downloadFileAndCheckForMultipleRanges({
      trigger: this.exportMetricData,
      rangeCount,
      fileNamePrefix,
    });
  }

  async checkMetricDownloadDataByStatus() {
    await downloadFileAndCheck(
      this.page,
      this.exportMetricData,
      'metricDataByStatusDownload.csv',
      async (fileDataString) => {
        const localCsvFile = fs.readFileSync(
          path.resolve(__dirname, '../../fixtures/cycle-time-by-status/metric-data-by-status.csv'),
        );
        const localCsv = parse(localCsvFile);
        const downloadCsv = parse(fileDataString);

        expect(localCsv).toStrictEqual(downloadCsv);
      },
    );
  }

  async checkMetricDownloadDataByColumn() {
    await downloadFileAndCheck(
      this.page,
      this.exportMetricData,
      'metricDataByColumnDownload.csv',
      async (fileDataString) => {
        const localCsvFile = fs.readFileSync(
          path.resolve(__dirname, '../../fixtures/cycle-time-by-status/metric-data-by-status.csv'),
        );
        const localCsv = parse(localCsvFile);
        const downloadCsv = parse(fileDataString);

        expect(localCsv).toStrictEqual(downloadCsv);
      },
    );
  }

  async checkDownloadReports() {
    await checkDownloadReport(this.page, this.exportMetricData, 'metricReport.csv');
    // await checkDownloadReport(this.page, this.exportBoardData, 'boardReport.csv');
    await checkDownloadReport(this.page, this.exportPipelineDataButton, 'pipelineReport.csv');
  }

  async checkDownloadWithHolidayReports() {
    await checkDownloadWithHolidayReport(this.page, this.exportMetricData, 'metricReport.csv');
    // await checkDownloadReport(this.page, this.exportBoardData, 'boardReport.csv');
    await checkDownloadWithHolidayReport(this.page, this.exportPipelineDataButton, 'pipelineReport.csv');
  }

  async checkDownloadReportsCycleTimeByStatus() {
    await checkDownloadReportCycleTimeByStatus(this.page, this.exportMetricData, 'metricReport.csv');
    await checkDownloadReportCycleTimeByStatus(this.page, this.exportBoardData, 'boardReport.csv');
  }

  async checkSelectListTab() {
    expect(await this.displayListTab.getAttribute('aria-selected')).toEqual('false');
    expect(await this.displayChartTab.getAttribute('aria-selected')).toEqual('true');
    await expect(this.chartTabsContainer).toBeVisible();
  }

  async goToChartBoardTab() {
    await this.displayChartTab.click();
  }

  async checkChartBoardTabStatus({
    showVelocityChart,
    showCycleTimeChart,
    showCycleTimeAllocationChart,
    showReworkChart,
    showClassificationIssueTypeChart = false,
    showClassificationAssigneeChart = false,
  }: {
    showVelocityChart: boolean;
    showCycleTimeChart: boolean;
    showCycleTimeAllocationChart: boolean;
    showReworkChart: boolean;
    showClassificationIssueTypeChart?: boolean;
    showClassificationAssigneeChart?: boolean;
  }) {
    expect(await this.displayListTab.getAttribute('aria-selected')).toEqual('false');
    expect(await this.displayChartTab.getAttribute('aria-selected')).toEqual('true');
    await expect(this.chartTabsContainer).toBeVisible();
    expect(await this.displayBoardChartTab.getAttribute('aria-selected')).toEqual('true');
    expect(await this.displayDoraChartTab.getAttribute('aria-selected')).toEqual('false');

    await expect(this.velocityLoading).toBeHidden();
    await expect(this.cycleTimeLoading).toBeHidden();
    await expect(this.cycleTimeAllocationLoading).toBeHidden();
    await expect(this.reworkLoading).toBeHidden();

    if (showVelocityChart) {
      await expect(this.velocityChart).toBeVisible();
      await expect(this.velocityTrendContainer).toBeVisible();
      await expect(this.velocityTrendContainer).toHaveAttribute('color', BOARD_CHART_VALUE.Velocity.color);
      await expect(this.velocityTrendIcon).toBeVisible();
      await expect(this.velocityTrendContainer).toContainText(BOARD_CHART_VALUE.Velocity.value);
    } else {
      await expect(this.velocityChart).not.toBeVisible();
      await expect(this.velocityTrendContainer).not.toBeVisible();
      await expect(this.velocityTrendIcon).not.toBeVisible();
    }

    if (showCycleTimeChart) {
      await expect(this.cycleTimeChart).toBeVisible();
      await expect(this.cycleTimeTrendContainer).toBeVisible();
      await expect(this.cycleTimeTrendContainer).toHaveAttribute(
        'color',
        BOARD_CHART_VALUE['Average Cycle Time'].color,
      );

      await expect(this.cycleTimeTrendIcon).toBeVisible();
      await expect(this.cycleTimeTrendContainer).toContainText(BOARD_CHART_VALUE['Average Cycle Time'].value);
    } else {
      await expect(this.cycleTimeChart).not.toBeVisible();
      await expect(this.cycleTimeTrendContainer).not.toBeVisible();
      await expect(this.cycleTimeTrendIcon).not.toBeVisible();
    }

    if (showCycleTimeAllocationChart) {
      await expect(this.cycleTimeAllocationChart).toBeVisible();
      await expect(this.cycleTimeAllocationTrendContainer).toBeVisible();
      await expect(this.cycleTimeAllocationTrendContainer).toHaveAttribute(
        'color',
        BOARD_CHART_VALUE['Cycle Time Allocation'].color,
      );
      await expect(this.cycleTimeAllocationTrendIcon).toBeVisible();
      await expect(this.cycleTimeAllocationTrendContainer).toContainText(
        BOARD_CHART_VALUE['Cycle Time Allocation'].value,
      );
    } else {
      await expect(this.cycleTimeAllocationChart).not.toBeVisible();
      await expect(this.cycleTimeAllocationTrendContainer).not.toBeVisible();
      await expect(this.cycleTimeAllocationTrendIcon).not.toBeVisible();
    }

    if (showReworkChart) {
      await expect(this.reworkChart).toBeVisible();
      await expect(this.reworkTrendContainer).toBeVisible();
      await expect(this.reworkTrendContainer).toHaveAttribute('color', BOARD_CHART_VALUE['Rework'].color);
      await expect(this.reworkTrendIcon).toBeVisible();
      await expect(this.reworkTrendContainer).toContainText(BOARD_CHART_VALUE['Rework'].value);
    } else {
      await expect(this.reworkChart).not.toBeVisible();
      await expect(this.reworkTrendContainer).not.toBeVisible();
      await expect(this.reworkTrendIcon).not.toBeVisible();
    }
    if (showClassificationIssueTypeChart) {
      await expect(this.classificationIssueTypeChart).toBeVisible();
      await expect(this.classificationIssueTypeChartSwitchIcon).toBeVisible();
    } else {
      await expect(this.classificationIssueTypeChart).not.toBeVisible();
      await expect(this.classificationIssueTypeChartSwitchIcon).not.toBeVisible();
    }
    if (showClassificationAssigneeChart) {
      await expect(this.classificationAssigneeChart).toBeVisible();
      await expect(this.classificationAssigneeChartSwitchIcon).toBeVisible();
    } else {
      await expect(this.classificationAssigneeChart).not.toBeVisible();
      await expect(this.classificationAssigneeChartSwitchIcon).not.toBeVisible();
    }
  }

  async goToCharDoraTab() {
    await this.displayDoraChartTab.click();
  }

  async checkChartDoraTabStatus({
    pipeline,
    showLeadTimeForChangeChart,
    showDeploymentFrequencyChart,
    showPipelineChangeFailureRateTrendContainer,
    showPipelineChangeFailureRateChart,
    showPipelineMeanTimeToRecoveryChart,
    showPipelineMeanTimeToRecoveryTrendContainer,
  }: {
    pipeline: string;
    showLeadTimeForChangeChart: boolean;
    showDeploymentFrequencyChart: boolean;
    showPipelineChangeFailureRateTrendContainer: boolean;
    showPipelineChangeFailureRateChart: boolean;
    showPipelineMeanTimeToRecoveryTrendContainer: boolean;
    showPipelineMeanTimeToRecoveryChart: boolean;
  }) {
    const pipelineDoraChartValue = DORA_CHART_VALUE[pipeline];
    expect(await this.displayBoardChartTab.getAttribute('aria-selected')).toEqual('false');
    expect(await this.displayDoraChartTab.getAttribute('aria-selected')).toEqual('true');
    await this.displayListTab.click();
    await this.displayChartTab.click();
    expect(await this.displayBoardChartTab.getAttribute('aria-selected')).toEqual('false');
    expect(await this.displayDoraChartTab.getAttribute('aria-selected')).toEqual('true');

    await expect(this.leadTimeForChangeLoading).toBeHidden();
    await expect(this.deploymentFrequencyLoading).toBeHidden();
    await expect(this.meanTimeToRecoveryLoading).toBeHidden();
    await expect(this.changeFailureRateLoading).toBeHidden();

    if (showLeadTimeForChangeChart) {
      await expect(this.leadTimeForChangeChart).toBeVisible();
      await expect(this.leadTimeForChangesTrendContainer).toBeVisible();
      await expect(this.leadTimeForChangesTrendContainer).toHaveAttribute(
        'color',
        pipelineDoraChartValue['Lead Time For Changes'].color,
      );
      await expect(this.leadTimeForChangesTrendIcon).toBeVisible();
      await expect(this.leadTimeForChangesTrendContainer).toContainText(
        pipelineDoraChartValue['Lead Time For Changes'].value,
      );
    } else {
      await expect(this.leadTimeForChangeChart).not.toBeVisible();
      await expect(this.leadTimeForChangesTrendContainer).not.toBeVisible();
      await expect(this.leadTimeForChangesTrendIcon).not.toBeVisible();
    }

    if (showDeploymentFrequencyChart) {
      await expect(this.deploymentFrequencyChart).toBeVisible();
      await expect(this.deploymentFrequencyTrendContainer).toBeVisible();
      await expect(this.deploymentFrequencyTrendContainer).toHaveAttribute(
        'color',
        pipelineDoraChartValue['Deployment Frequency'].color,
      );
      await expect(this.deploymentFrequencyTrendIcon).toBeVisible();
      await expect(this.deploymentFrequencyTrendContainer).toContainText(
        pipelineDoraChartValue['Deployment Frequency'].value,
      );
    } else {
      await expect(this.deploymentFrequencyChart).not.toBeVisible();
      await expect(this.deploymentFrequencyTrendContainer).not.toBeVisible();
      await expect(this.deploymentFrequencyTrendIcon).not.toBeVisible();
    }

    if (showPipelineChangeFailureRateChart) {
      await expect(this.changeFailureRateChart).toBeVisible();
      if (showPipelineChangeFailureRateTrendContainer) {
        await expect(this.pipelineChangeFailureRateTrendContainer).toBeVisible();
        await expect(this.pipelineChangeFailureRateTrendContainer).toHaveAttribute(
          'color',
          pipelineDoraChartValue['Pipeline Change Failure Rate'].color,
        );
        await expect(this.pipelineChangeFailureRateTrendIcon).toBeVisible();
        await expect(this.pipelineChangeFailureRateTrendContainer).toContainText(
          pipelineDoraChartValue['Pipeline Change Failure Rate'].value,
        );
      } else {
        await expect(this.pipelineChangeFailureRateTrendContainer).not.toBeVisible();
        await expect(this.pipelineChangeFailureRateTrendIcon).not.toBeVisible();
      }
    } else {
      await expect(this.changeFailureRateChart).not.toBeVisible();
      await expect(this.pipelineChangeFailureRateTrendContainer).not.toBeVisible();
      await expect(this.pipelineChangeFailureRateTrendIcon).not.toBeVisible();
    }

    if (showPipelineMeanTimeToRecoveryChart) {
      await expect(this.meanTimeToRecoveryChart).toBeVisible();
      if (showPipelineMeanTimeToRecoveryTrendContainer) {
        await expect(this.pipelineMeanTimeToRecoveryTrendContainer).toBeVisible();
        await expect(this.pipelineMeanTimeToRecoveryTrendContainer).toHaveAttribute(
          'color',
          pipelineDoraChartValue['Pipeline Mean Time To Recovery'].color,
        );
        await expect(this.pipelineMeanTimeToRecoveryTrendIcon).toBeVisible();
        await expect(this.pipelineMeanTimeToRecoveryTrendContainer).toContainText(
          pipelineDoraChartValue['Pipeline Mean Time To Recovery'].value,
        );
      } else {
        await expect(this.pipelineMeanTimeToRecoveryTrendContainer).not.toBeVisible();
        await expect(this.pipelineMeanTimeToRecoveryTrendIcon).not.toBeVisible();
      }
    } else {
      await expect(this.meanTimeToRecoveryChart).not.toBeVisible();
      await expect(this.pipelineMeanTimeToRecoveryTrendContainer).not.toBeVisible();
      await expect(this.pipelineMeanTimeToRecoveryTrendIcon).not.toBeVisible();
    }
  }

  async checkPipelineSelectorAndDoraChart({
    pipelines,
    showLeadTimeForChangeChart,
    showDeploymentFrequencyChart,
    showDevChangeFailureRateTrendContainer,
    showDevChangeFailureRateChart,
    showDevMeanTimeToRecoveryChart,
    showDevMeanTimeToRecoveryTrendContainer,
  }: {
    pipelines: string[];
    showLeadTimeForChangeChart: boolean;
    showDeploymentFrequencyChart: boolean;
    showDevChangeFailureRateTrendContainer: boolean;
    showDevChangeFailureRateChart: boolean;
    showDevMeanTimeToRecoveryTrendContainer: boolean;
    showDevMeanTimeToRecoveryChart: boolean;
  }) {
    await expect(this.doraPipelineSelector).toBeVisible();
    await this.checkPipelineSelectorOptions({
      pipelines,
      showLeadTimeForChangeChart,
      showDeploymentFrequencyChart,
      showDevChangeFailureRateTrendContainer,
      showDevChangeFailureRateChart,
      showDevMeanTimeToRecoveryChart,
      showDevMeanTimeToRecoveryTrendContainer,
    });
  }

  async checkPipelineSelectorOptions({
    pipelines,
    showLeadTimeForChangeChart,
    showDeploymentFrequencyChart,
    showDevChangeFailureRateTrendContainer,
    showDevChangeFailureRateChart,
    showDevMeanTimeToRecoveryChart,
    showDevMeanTimeToRecoveryTrendContainer,
  }: {
    pipelines: string[];
    showLeadTimeForChangeChart: boolean;
    showDeploymentFrequencyChart: boolean;
    showDevChangeFailureRateTrendContainer: boolean;
    showDevChangeFailureRateChart: boolean;
    showDevMeanTimeToRecoveryTrendContainer: boolean;
    showDevMeanTimeToRecoveryChart: boolean;
  }) {
    await this.doraPipelineSelector.click();
    const singleOption = this.page.getByLabel(`single-option`);
    await expect(singleOption).toHaveCount(2);

    for (let i = 0; i < 1; i++) {
      await expect(singleOption.nth(i)).toHaveText(pipelines[i]);
    }

    for (let i = 0; i < 1; i++) {
      await this.doraPipelineSelector.click();
      await singleOption.nth(i).click();
      this.checkChartDoraTabStatus({
        pipeline: pipelines[i],
        showPipelineMeanTimeToRecoveryTrendContainer: showDevMeanTimeToRecoveryTrendContainer,
        showLeadTimeForChangeChart: showLeadTimeForChangeChart,
        showDeploymentFrequencyChart: showDeploymentFrequencyChart,
        showPipelineChangeFailureRateTrendContainer: showDevChangeFailureRateTrendContainer,
        showPipelineChangeFailureRateChart: showDevChangeFailureRateChart,
        showPipelineMeanTimeToRecoveryChart: showDevMeanTimeToRecoveryChart,
      });
    }
  }

  async goToReportListTab() {
    await this.displayListTab.click();
  }

  async checkExplanation() {
    await expect(this.leadTimeForChangesExplanationIcon).toBeVisible();
    await this.clickExplanationAndCheckDialog(this.leadTimeForChangesExplanationIcon);

    await expect(this.deploymentFrequencyExplanationIcon).toBeVisible();
    await this.clickExplanationAndCheckDialog(this.deploymentFrequencyExplanationIcon);

    await expect(this.pipelineChangeFailureRateExplanationIcon).toBeVisible();
    await this.clickExplanationAndCheckDialog(this.pipelineChangeFailureRateExplanationIcon);

    await expect(this.pipelineMeanTimeToRecoveryExplanationIcon).toBeVisible();
    await this.clickExplanationAndCheckDialog(this.pipelineMeanTimeToRecoveryExplanationIcon);
  }

  async clickExplanationAndCheckDialog(explanationIcon: Locator) {
    await expect(this.doraMetricsDialog).not.toBeVisible();
    await expect(this.doraMetricsDialogContainer).not.toBeVisible();
    await expect(this.doraMetricsDialogClose).not.toBeVisible();
    await expect(this.doraMetricsDialogDefinition).not.toBeVisible();
    await expect(this.doraMetricsDialogInfluencedFactors).not.toBeVisible();
    await expect(this.doraMetricsDialogFormula).not.toBeVisible();

    await explanationIcon.click();

    await expect(this.doraMetricsDialog).toBeVisible();
    await expect(this.doraMetricsDialogContainer).toBeVisible();
    await expect(this.doraMetricsDialogClose).toBeVisible();
    await expect(this.doraMetricsDialogDefinition).toBeVisible();
    await expect(this.doraMetricsDialogInfluencedFactors).toBeVisible();
    await expect(this.doraMetricsDialogFormula).toBeVisible();

    await this.doraMetricsDialogFormula.locator('a').click();

    const newPage = await this.page.waitForEvent('popup');
    const newPageUrl = newPage.url();

    expect(newPageUrl).toContain('https://github.com/au-heartbeat/Heartbeat?tab=readme-ov-file'); // Check if the new page URL contains a specific string

    await newPage.close();

    await this.doraMetricsDialogClose.click();

    await expect(this.doraMetricsDialog).not.toBeVisible();
    await expect(this.doraMetricsDialogContainer).not.toBeVisible();
    await expect(this.doraMetricsDialogClose).not.toBeVisible();
    await expect(this.doraMetricsDialogDefinition).not.toBeVisible();
    await expect(this.doraMetricsDialogInfluencedFactors).not.toBeVisible();
    await expect(this.doraMetricsDialogFormula).not.toBeVisible();
  }
}
