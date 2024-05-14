import {
  IBoardMetricsDetailItem,
  IBoardMetricsResult,
  IBoardCycletimeDetailItem,
  IBoardClassificationDetailItem,
} from '../../fixtures/create-new/report-result';
import { checkDownloadReport, checkDownloadReportCycleTimeByStatus, downloadFileAndCheck } from 'e2e/utils/download';
import { expect, Locator, Page } from '@playwright/test';
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
  readonly devMeanTimeToRecovery: Locator;
  readonly showMoreLinks: Locator;
  readonly previousButton: Locator;
  readonly backButton: Locator;
  readonly exportPipelineDataButton: Locator;
  readonly exportBoardData: Locator;
  readonly exportMetricData: Locator;
  readonly homeIcon: Locator;
  readonly velocityRows: Locator;
  readonly cycleTimeRows: Locator;
  readonly classificationRows: Locator;
  readonly leadTimeForChangesRows: Locator;
  readonly devChangeFailureRateRows: Locator;
  readonly deploymentFrequencyRows: Locator;
  readonly devMeanTimeToRecoveryRows: Locator;
  readonly reworkRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = this.page.locator('[data-test-id="Header"]');
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
    this.failureRate = this.page.locator('[data-test-id="Dev Change Failure Rate"] [data-test-id="report-section"]');
    this.devMeanTimeToRecovery = this.page.locator(
      '[data-test-id="Dev Mean Time To Recovery"] [data-test-id="report-section"]',
    );
    this.showMoreLinks = this.page.getByText('show more >');
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.backButton = this.page.getByText('Back');
    this.exportMetricData = this.page.getByText('Export metric data');
    this.exportBoardData = this.page.getByText('Export board data');
    this.exportPipelineDataButton = this.page.getByText('Export pipeline data');
    this.homeIcon = page.getByLabel('Home');
    this.velocityRows = this.page.getByTestId('Velocity').locator('tbody').getByRole('row');
    this.cycleTimeRows = this.page.getByTestId('Cycle Time').locator('tbody').getByRole('row');
    this.deploymentFrequencyRows = this.page.getByTestId('Deployment Frequency').locator('tbody').getByRole('row');
    this.classificationRows = this.page.getByTestId('Classification').locator('tbody').getByRole('row');
    this.leadTimeForChangesRows = this.page.getByTestId('Lead Time For Changes').getByRole('row');
    this.devChangeFailureRateRows = this.page.getByTestId('Dev Change Failure Rate').locator('tbody').getByRole('row');
    this.devMeanTimeToRecoveryRows = this.page
      .getByTestId('Dev Mean Time To Recovery')
      .locator('tbody')
      .getByRole('row');
    this.reworkRows = this.page.getByTestId('Rework').getByRole('row');
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

  async checkDoraMetricsReportDetails() {
    await expect(this.deploymentFrequencyRows.getByRole('cell').nth(0)).toContainText('Heartbeat/ Deploy prod');
    await expect(this.deploymentFrequencyRows.getByRole('cell').nth(1)).toContainText('6.60');

    await expect(this.leadTimeForChangesRows.nth(2)).toContainText(this.combineStrings(['PR Lead Time', '6.12']));
    await expect(this.leadTimeForChangesRows.nth(3)).toContainText(this.combineStrings(['Pipeline Lead Time', '0.50']));
    await expect(this.leadTimeForChangesRows.nth(4)).toContainText(this.combineStrings(['Total Lead Time', '6.62']));

    await expect(this.devChangeFailureRateRows.getByRole('cell').nth(0)).toContainText('Heartbeat/ Deploy prod');
    await expect(this.devChangeFailureRateRows.getByRole('cell').nth(1)).toContainText('17.50%(7/40)');
    await expect(this.devMeanTimeToRecoveryRows.getByRole('cell').nth(0)).toContainText('Heartbeat/ Deploy prod');
    await expect(this.devMeanTimeToRecoveryRows.getByRole('cell').nth(1)).toContainText('1.90');
  }

  async checkDoraMetricsDetails(projectCreationType: ProjectCreationType) {
    await this.showMoreLinks.nth(1).click();
    if (
      projectCreationType === ProjectCreationType.IMPORT_PROJECT_FROM_FILE ||
      projectCreationType === ProjectCreationType.CREATE_A_NEW_PROJECT
    ) {
      await this.checkDoraMetricsReportDetails();
    } else {
      throw Error('The board detail type is not correct, please give a correct one.');
    }
    await downloadFileAndCheck(this.page, this.exportPipelineDataButton, 'pipelineData.csv', async (fileDataString) => {
      const localCsvFile = fs.readFileSync(path.resolve(__dirname, '../../fixtures/create-new/pipeline-data.csv'));
      const localCsv = parse(localCsvFile);
      const downloadCsv = parse(fileDataString);

      expect(localCsv).toStrictEqual(downloadCsv);
    });
    await this.backButton.click();
  }

  async confirmGeneratedReport() {
    await expect(this.page.getByRole('alert').first()).toContainText('Help Information');
    await expect(this.page.getByRole('alert').first()).toContainText(
      'The file will expire in 30 minutes, please download it in time.',
    );
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
      // const currentMetric = cycleTimeData[i];
      // await expect(this.cycleTimeRows.filter({ hasText: currentMetric.name }).getByRole('cell').nth(1)).toContainText(
      //   currentMetric.line1Value,
      // );
      // if (currentMetric.line2Value) {
      //   const targetValue = await this.cycleTimeRows
      //     .filter({ hasText: currentMetric.name })
      //     .locator('+tr')
      //     .getByRole('cell')
      //     .first()
      //     .innerHTML();
      //   expect(targetValue).toEqual(currentMetric.line2Value);
      // }

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

  async checkBoardMetricsReportReportDetail({
    velocityData,
    cycleTimeData,
    classificationData,
  }: {
    velocityData: IBoardMetricsDetailItem[][];
    cycleTimeData: IBoardCycletimeDetailItem[][];
    classificationData: IBoardClassificationDetailItem[][];
  }) {
    await this.checkVelocityDetailForMultipleRanges(velocityData);
    await this.checkCycleTimeDetailForMultipleRanges(cycleTimeData);
    await this.checkClassificationDetailForMultipleRanges(classificationData);
    // await expect(this.classificationRows.nth(1)).toContainText(this.combineStrings(['Spike', '11.11%']));
    // await expect(this.classificationRows.nth(2)).toContainText(this.combineStrings(['Task', '88.89%']));
    // await expect(this.classificationRows.nth(4)).toContainText(this.combineStrings(['ADM-322', '66.67%']));
    // await expect(this.classificationRows.nth(5)).toContainText(this.combineStrings(['ADM-279', '22.22%']));
    // await expect(this.classificationRows.nth(6)).toContainText(this.combineStrings(['ADM-319', '11.11%']));
    // await expect(this.classificationRows.nth(8)).toContainText(this.combineStrings(['None', '100.00%']));
    // await expect(this.classificationRows.nth(10)).toContainText(this.combineStrings(['1.0', '88.89%']));
    // await expect(this.classificationRows.nth(11)).toContainText(this.combineStrings(['None', '11.11%']));
    // await expect(this.classificationRows.nth(13)).toContainText(this.combineStrings(['Sprint 26', '11.11%']));
    // await expect(this.classificationRows.nth(14)).toContainText(this.combineStrings(['Sprint 27', '100.00%']));
    // await expect(this.classificationRows.nth(15)).toContainText(this.combineStrings(['Sprint 28', '88.89%']));
    // await expect(this.classificationRows.nth(17)).toContainText(this.combineStrings(['Auto Dora Metrics', '100.00%']));
    // await expect(this.classificationRows.nth(19)).toContainText(this.combineStrings(['None', '100.00%']));
    // await expect(this.classificationRows.nth(21)).toContainText(this.combineStrings(['None', '100.00%']));
    // await expect(this.classificationRows.nth(23)).toContainText(this.combineStrings(['Medium', '100.00%']));
    // await expect(this.classificationRows.nth(25)).toContainText(this.combineStrings(['None', '100.00%']));
    // await expect(this.classificationRows.nth(27)).toContainText(this.combineStrings(['Stream1', '44.44%']));
    // await expect(this.classificationRows.nth(28)).toContainText(this.combineStrings(['Stream2', '55.56%']));
    // await expect(this.classificationRows.nth(30)).toContainText(this.combineStrings(['None', '100.00%']));
    // await expect(this.classificationRows.nth(32)).toContainText(this.combineStrings(['1.0', '44.44%']));
    // await expect(this.classificationRows.nth(33)).toContainText(this.combineStrings(['2.0', '22.22%']));
    // await expect(this.classificationRows.nth(34)).toContainText(this.combineStrings(['3.0', '33.33%']));
    // await expect(this.classificationRows.nth(36)).toContainText(this.combineStrings(['Weiran Sun', '11.11%']));
    // await expect(this.classificationRows.nth(37)).toContainText(this.combineStrings(['None', '88.89%']));
    // await expect(this.classificationRows.nth(39)).toContainText(this.combineStrings(['None', '100.00%']));
    // await expect(this.classificationRows.nth(41)).toContainText(this.combineStrings(['heartbeat user', '44.44%']));
    // await expect(this.classificationRows.nth(42)).toContainText(this.combineStrings(['Junbo Dai', '11.11%']));
    // await expect(this.classificationRows.nth(43)).toContainText(this.combineStrings(['Xinyi Wang', '11.11%']));
    // await expect(this.classificationRows.nth(44)).toContainText(this.combineStrings(['Weiran Sun', '11.11%']));
    // await expect(this.classificationRows.nth(45)).toContainText(this.combineStrings(['Xuebing Li', '11.11%']));
    // await expect(this.classificationRows.nth(46)).toContainText(this.combineStrings(['Yunsong Yang', '11.11%']));
    // await expect(this.reworkRows.filter({ hasText: 'Total rework' }).getByRole('cell').nth(1)).toContainText(
    //   '11 (times)',
    // );
    // await expect(this.reworkRows.filter({ hasText: 'From block to in Dev' }).getByRole('cell').nth(1)).toContainText(
    //   '11 (times)',
    // );
    // await expect(this.reworkRows.filter({ hasText: 'Total rework cards' }).getByRole('cell').nth(1)).toContainText(
    //   '6 (cards)',
    // );
    // await expect(this.reworkRows.filter({ hasText: 'Rework cards ratio' }).getByRole('cell').nth(1)).toContainText(
    //   '66.67% (rework cards/throughput)',
    // );
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
    await expect(this.devMeanTimeToRecovery).toBeHidden();
  }

  async checkOnlyDeploymentFrequencyPartVisible() {
    await expect(this.totalLeadTime).toBeHidden();
    await expect(this.deploymentFrequency).toBeVisible();
    await expect(this.failureRate).toBeHidden();
    await expect(this.devMeanTimeToRecovery).toBeHidden();
  }

  async checkOnlyChangeFailureRatePartVisible() {
    await expect(this.totalLeadTime).toBeHidden();
    await expect(this.deploymentFrequency).toBeHidden();
    await expect(this.failureRate).toBeVisible();
    await expect(this.devMeanTimeToRecovery).toBeHidden();
  }

  async checkOnlyMeanTimeToRecoveryPartVisible() {
    await expect(this.totalLeadTime).toBeHidden();
    await expect(this.deploymentFrequency).toBeHidden();
    await expect(this.failureRate).toBeHidden();
    await expect(this.devMeanTimeToRecovery).toBeVisible();
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

  async checkBoardMetricsDetails(
    boardDetailType: ProjectCreationType,
    csvCompareLines: number,
    {
      velocityData,
      cycleTimeData,
      classificationData,
    }: {
      velocityData: IBoardMetricsDetailItem[][];
      cycleTimeData: IBoardCycletimeDetailItem[][];
      classificationData: IBoardClassificationDetailItem[][];
    },
  ) {
    await this.showMoreLinks.first().click();
    if (
      boardDetailType === ProjectCreationType.IMPORT_PROJECT_FROM_FILE ||
      boardDetailType === ProjectCreationType.CREATE_A_NEW_PROJECT
    ) {
      await this.checkBoardMetricsReportReportDetail({ velocityData, cycleTimeData, classificationData });
    } else {
      throw Error('The board detail type is not correct, please give a correct one.');
    }

    // await downloadFileAndCheck(this.page, this.exportBoardData, 'boardData.csv', async (fileDataString) => {
    //   const localCsvFile = fs.readFileSync(path.resolve(__dirname, '../../fixtures/create-new/board-data.csv'));
    //   const localCsv = parse(localCsvFile, { to: csvCompareLines });
    //   const downloadCsv = parse(fileDataString, { to: csvCompareLines });

    //   expect(localCsv).toStrictEqual(downloadCsv);
    // });
    await this.backButton.click();
  }

  async checkBoardDownloadDataWithoutBlock(fileName: string) {
    await downloadFileAndCheck(
      this.page,
      this.exportBoardData,
      'board-data-without-block-column.csv',
      async (fileDataString) => {
        const localCsvFile = fs.readFileSync(path.resolve(__dirname, fileName));
        const localCsv = parse(localCsvFile);
        const downloadCsv = parse(fileDataString);

        expect(localCsv).toStrictEqual(downloadCsv);
      },
    );
  }

  async checkDoraMetrics(
    prLeadTime: string,
    pipelineLeadTime: string,
    totalLeadTime: string,
    deploymentFrequency: string,
    failureRate: string,
    devMeanTimeToRecovery: string,
  ) {
    await expect(this.prLeadTime).toContainText(`${prLeadTime}PR Lead Time(Hours)`);
    await expect(this.pipelineLeadTime).toContainText(`${pipelineLeadTime}Pipeline Lead Time(Hours)`);
    await expect(this.totalLeadTime).toContainText(`${totalLeadTime}Total Lead Time(Hours)`);
    await expect(this.deploymentFrequency).toContainText(`${deploymentFrequency}(Deployments/Days)`);
    await expect(this.failureRate).toContainText(failureRate);
    await expect(this.devMeanTimeToRecovery).toContainText(`${devMeanTimeToRecovery}(Hours)`);
  }

  async checkMetricDownloadData() {
    await downloadFileAndCheck(this.page, this.exportMetricData, 'metricData.csv', async (fileDataString) => {
      const localCsvFile = fs.readFileSync(path.resolve(__dirname, '../../fixtures/create-new/metric-data.csv'));
      const localCsv = parse(localCsvFile);
      const downloadCsv = parse(fileDataString);

      expect(localCsv).toStrictEqual(downloadCsv);
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

  async checkDownloadReportsCycleTimeByStatus() {
    await checkDownloadReportCycleTimeByStatus(this.page, this.exportMetricData, 'metricReport.csv');
    await checkDownloadReportCycleTimeByStatus(this.page, this.exportBoardData, 'boardReport.csv');
  }

  async clickHomeIconThenBackToHomepage() {
    await this.homeIcon.click();
    await expect(this.page).toHaveURL(/\//);
  }
}
