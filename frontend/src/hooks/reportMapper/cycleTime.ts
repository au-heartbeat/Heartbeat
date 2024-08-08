import { ReportDataWithTwoColumns, ValueWithUnits } from '@src/hooks/reportMapper/reportUIDataStructure';
import { CycleTimeMetricsName, METRICS_CONSTANTS, ReportSuffixUnits } from '@src/constants/resources';
import { CycleTimeResponse, Swimlane } from '@src/clients/report/dto/response';

export const cycleTimeMapper = ({
  swimlaneList,
  totalTimeForCards,
  averageCycleTimePerSP,
  averageCycleTimePerCard,
}: CycleTimeResponse) => {
  const mappedCycleTimeValue: ReportDataWithTwoColumns[] = [];

  const getSwimlaneByItemName = (itemName: string) => {
    return swimlaneList.find((item: Swimlane) => item.optionalItemName === itemName);
  };
  const calPerColumnTotalTimeDivTotalTime = (itemName: string): ValueWithUnits[] => {
    const swimlane = getSwimlaneByItemName(itemName);
    return swimlane ? [{ value: `${parseFloat(((swimlane.totalTime / totalTimeForCards) * 100).toFixed(2))}%` }] : [];
  };
  const getAverageTimeForPerColumn = (itemName: string) => {
    const swimlane = getSwimlaneByItemName(itemName);
    return swimlane
      ? [
          { value: swimlane.averageTimeForSP.toFixed(2), unit: ReportSuffixUnits.DaysPerSP },
          {
            value: swimlane.averageTimeForCards.toFixed(2),
            unit: ReportSuffixUnits.DaysPerCard,
          },
        ]
      : [];
  };

  const cycleTimeValue: { [key: string]: ValueWithUnits[] } = {
    [CycleTimeMetricsName.AVERAGE_CYCLE_TIME]: [
      { value: Number(averageCycleTimePerSP.toFixed(2)), unit: ReportSuffixUnits.DaysPerSP },
      {
        value: averageCycleTimePerCard.toFixed(2),
        unit: ReportSuffixUnits.DaysPerCard,
      },
    ],
    [CycleTimeMetricsName.ANALYSIS_PROPORTION]: calPerColumnTotalTimeDivTotalTime(METRICS_CONSTANTS.analysisValue),
    [CycleTimeMetricsName.DESIGN_PROPORTION]: calPerColumnTotalTimeDivTotalTime(METRICS_CONSTANTS.designValue),
    [CycleTimeMetricsName.DEVELOPMENT_PROPORTION]: calPerColumnTotalTimeDivTotalTime(METRICS_CONSTANTS.inDevValue),
    [CycleTimeMetricsName.WAITING_FOR_TESTING_PROPORTION]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.waitingForTestingValue,
    ),
    [CycleTimeMetricsName.BLOCK_PROPORTION]: calPerColumnTotalTimeDivTotalTime(METRICS_CONSTANTS.blockValue),
    [CycleTimeMetricsName.REVIEW_PROPORTION]: calPerColumnTotalTimeDivTotalTime(METRICS_CONSTANTS.reviewValue),
    [CycleTimeMetricsName.TESTING_PROPORTION]: calPerColumnTotalTimeDivTotalTime(METRICS_CONSTANTS.testingValue),
    [CycleTimeMetricsName.WAITING_FOR_DEPLOYMENT_PROPORTION]: calPerColumnTotalTimeDivTotalTime(
      METRICS_CONSTANTS.waitingForDeploymentValue,
    ),
    [CycleTimeMetricsName.AVERAGE_ANALYSIS_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.analysisValue),
    [CycleTimeMetricsName.AVERAGE_DESIGN_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.designValue),
    [CycleTimeMetricsName.AVERAGE_DEVELOPMENT_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.inDevValue),
    [CycleTimeMetricsName.AVERAGE_WAITING_FOR_TESTING_TIME]: getAverageTimeForPerColumn(
      METRICS_CONSTANTS.waitingForTestingValue,
    ),
    [CycleTimeMetricsName.AVERAGE_BLOCK_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.blockValue),
    [CycleTimeMetricsName.AVERAGE_REVIEW_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.reviewValue),
    [CycleTimeMetricsName.AVERAGE_TESTING_TIME]: getAverageTimeForPerColumn(METRICS_CONSTANTS.testingValue),
    [CycleTimeMetricsName.AVERAGE_WAITING_FOR_DEPLOYMENT_TIME]: getAverageTimeForPerColumn(
      METRICS_CONSTANTS.waitingForDeploymentValue,
    ),
  };

  Object.values(CycleTimeMetricsName).map((cycleName) => {
    if (cycleTimeValue[cycleName].length > 0) {
      mappedCycleTimeValue.push({
        id: mappedCycleTimeValue.length,
        name: cycleName,
        valueList: cycleTimeValue[cycleName],
      });
    }
  });

  return mappedCycleTimeValue;
};
