import React, { useEffect, useRef } from 'react';

import {
  AREA_STYLE,
  LABEL_PERCENT,
  LEFT_RIGHT_ALIGN_LABEL,
  NO_LABEL,
} from '@src/containers/ReportStep/BoardMetricsChart';
import {
  ChartType,
  EMPTY_DATA_MAPPER_DORA_CHART,
  LEAD_TIME_CHARTS_MAPPING,
  RequiredData,
} from '@src/constants/resources';
import { oneLineOptionMapper, Series, stackedBarOptionMapper } from '@src/containers/ReportStep/ChartOption';
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { stackedAreaOptionMapper } from '@src/containers/ReportStep/ChartOption';
import { calculateTrendInfo, percentageFormatter } from '@src/utils/util';
import { ChartContainer } from '@src/containers/MetricsStep/style';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { showChart } from '@src/containers/ReportStep';
import { EMPTY_STRING } from '@src/constants/commons';
import { theme } from '@src/theme';

interface DoraMetricsChartProps {
  dateRanges: string[];
  data: (ReportResponseDTO | undefined)[];
  metrics: string[];
}

enum DORAMetricsChartType {
  LeadTimeForChanges = 'leadTimeForChangesList',
  DeploymentFrequency = 'deploymentFrequencyList',
  DevChangeFailureRate = 'devChangeFailureRateList',
  DevMeanTimeToRecovery = 'devMeanTimeToRecoveryList',
}

const AVERAGE = 'Average';

function extractedStackedBarData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const extractedName = mappedData?.[0].leadTimeForChangesList?.[0].valueList
    .map((item) => LEAD_TIME_CHARTS_MAPPING[item.name])
    .slice(0, 2);
  const extractedValues = mappedData?.map((data) => {
    const averageItem = data.leadTimeForChangesList?.find((leadTimeForChange) => leadTimeForChange.name === AVERAGE);
    if (!averageItem) return [];

    return averageItem.valueList.map((item) => Number(item.value));
  });

  const leadTimeValues = extractedValues?.map((value) => value![2]);
  const trendInfo = calculateTrendInfo(leadTimeValues, allDateRanges, ChartType.LeadTimeForChanges);

  return {
    legend: 'Lead Time For Change',
    xAxis: allDateRanges,
    yAxis: {
      name: 'Hours',
      alignTick: false,
      axisLabel: NO_LABEL,
    },

    series: extractedName?.map((name, index) => {
      const series: Series = {
        name: name,
        type: 'bar',
        data: extractedValues!.map((value) => {
          return value![index];
        }),
      };
      return series;
    }),

    color: [theme.main.doraChart.barColorA, theme.main.doraChart.barColorB, theme.main.doraChart.barColorC],
    trendInfo,
  };
}

function extractedDeploymentFrequencyData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.deploymentFrequencyList);
  const averageDeploymentFrequency = data?.map((items) => {
    const averageItem = items?.find((item) => item.name === AVERAGE);
    if (!averageItem) return 0;
    return Number(averageItem.valueList[0].value) || 0;
  });
  const deployTimes = data?.map((items) => {
    const averageItem = items?.find((item) => item.name === AVERAGE);
    if (!averageItem) return 0;
    return Number(averageItem.valueList[1].value) || 0;
  });
  const trendInfo = calculateTrendInfo(averageDeploymentFrequency, allDateRanges, ChartType.DeploymentFrequency);
  return {
    xAxis: {
      data: allDateRanges,
      boundaryGap: false,
      axisLabel: LEFT_RIGHT_ALIGN_LABEL,
    },
    yAxis: [
      {
        name: RequiredData.DeploymentFrequency,
        alignTick: false,
        axisLabel: NO_LABEL,
      },
      {
        name: RequiredData.DeploymentTimes,
        alignTick: false,
        axisLabel: NO_LABEL,
      },
    ],
    series: [
      {
        name: RequiredData.DeploymentFrequency,
        type: 'line',
        data: averageDeploymentFrequency!,
        yAxisIndex: 0,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
      {
        name: RequiredData.DeploymentTimes,
        type: 'line',
        data: deployTimes!,
        yAxisIndex: 1,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
    ],
    color: [theme.main.boardChart.lineColorA, theme.main.boardChart.lineColorB],
    trendInfo,
  };
}

function extractedChangeFailureRateData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.devChangeFailureRateList);
  const value = data?.map((items) => {
    const averageItem = items?.find((item) => item.name === AVERAGE);
    if (!averageItem) return 0;
    return Number(averageItem.valueList[0].value) || 0;
  });
  const trendInfo = calculateTrendInfo(value, allDateRanges, ChartType.DevChangeFailureRate);
  return {
    legend: RequiredData.DevChangeFailureRate,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Failed/Total',
      axisLabel: LABEL_PERCENT,
      alignTick: false,
    },
    series: {
      name: RequiredData.DevChangeFailureRate,
      type: 'line',
      data: value!,
      tooltip: {
        valueFormatter: percentageFormatter(!!value),
      },
    },
    color: theme.main.doraChart.devChangeFailureRateColor,
    trendInfo,
  };
}

function extractedMeanTimeToRecoveryDataData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.devMeanTimeToRecoveryList);
  const value = data?.map((items) => {
    const averageItem = items?.find((item) => item.name === AVERAGE);
    if (!averageItem) return 0;
    return Number(averageItem.valueList[0].value) || 0;
  });
  const trendInfo = calculateTrendInfo(value, allDateRanges, ChartType.DevMeanTimeToRecovery);
  return {
    legend: RequiredData.DevMeanTimeToRecovery,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Hours',
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: RequiredData.DevMeanTimeToRecovery,
      type: 'line',
      data: value!,
    },
    color: theme.main.doraChart.devMeanTimeToRecoveryColor,
    trendInfo,
  };
}

type ChartValueSource = { id: number; name: string; valueList: { value: string }[] };

function isDoraMetricsChartFinish({
  dateRangeLength,
  mappedData,
  type,
}: {
  dateRangeLength: number;
  mappedData: (
    | ReportResponse
    | {
        deploymentFrequencyList: ChartValueSource[];
        devChangeFailureRateList: ChartValueSource[];
        devMeanTimeToRecoveryList: ChartValueSource[];
        exportValidityTimeMin: number;
        leadTimeForChangesList: ChartValueSource[];
      }
  )[];
  type: DORAMetricsChartType;
}): boolean {
  const valueList = mappedData
    .flatMap((value) => value[type] as unknown as ChartValueSource[])
    .filter((value) => value?.name === AVERAGE)
    .map((value) => value?.valueList);

  return (
    valueList.length === dateRangeLength && valueList.every((value) => value?.every((it) => it.value != EMPTY_STRING))
  );
}

export const DoraMetricsChart = ({ data, dateRanges, metrics }: DoraMetricsChartProps) => {
  const leadTimeForChange = useRef<HTMLDivElement>(null);
  const deploymentFrequency = useRef<HTMLDivElement>(null);
  const changeFailureRate = useRef<HTMLDivElement>(null);
  const meanTimeToRecovery = useRef<HTMLDivElement>(null);

  const mappedData = data.map((currentData) => {
    if (!currentData?.doraMetricsCompleted) {
      return EMPTY_DATA_MAPPER_DORA_CHART('');
    } else {
      return reportMapper(currentData);
    }
  });

  const dateRangeLength: number = dateRanges.length;

  const isLeadTimeForChangesFinished: boolean = isDoraMetricsChartFinish({
    dateRangeLength,
    mappedData,
    type: DORAMetricsChartType.LeadTimeForChanges,
  });
  const isDeploymentFrequencyFinished: boolean = isDoraMetricsChartFinish({
    dateRangeLength,
    mappedData,
    type: DORAMetricsChartType.DeploymentFrequency,
  });
  const isDevChangeFailureRateFinished: boolean = isDoraMetricsChartFinish({
    dateRangeLength,
    mappedData,
    type: DORAMetricsChartType.DevChangeFailureRate,
  });
  const isDevMeanTimeToRecoveryValueListFinished: boolean = isDoraMetricsChartFinish({
    dateRangeLength,
    mappedData,
    type: DORAMetricsChartType.DevMeanTimeToRecovery,
  });

  const leadTimeForChangeData = extractedStackedBarData(dateRanges, mappedData);
  const leadTimeForChangeDataOption = leadTimeForChangeData && stackedBarOptionMapper(leadTimeForChangeData, false);
  const deploymentFrequencyData = extractedDeploymentFrequencyData(dateRanges, mappedData);
  const deploymentFrequencyDataOption = deploymentFrequencyData && stackedAreaOptionMapper(deploymentFrequencyData);
  const changeFailureRateData = extractedChangeFailureRateData(dateRanges, mappedData);
  const changeFailureRateDataOption = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(dateRanges, mappedData);
  const meanTimeToRecoveryDataOption = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);

  useEffect(() => {
    showChart(leadTimeForChange.current, isLeadTimeForChangesFinished, leadTimeForChangeDataOption);
  }, [leadTimeForChange, leadTimeForChangeDataOption, isLeadTimeForChangesFinished]);

  useEffect(() => {
    showChart(deploymentFrequency.current, isDeploymentFrequencyFinished, deploymentFrequencyDataOption);
  }, [deploymentFrequency, deploymentFrequencyDataOption, isDeploymentFrequencyFinished]);

  useEffect(() => {
    showChart(changeFailureRate.current, isDevChangeFailureRateFinished, changeFailureRateDataOption);
  }, [changeFailureRate, changeFailureRateDataOption, isDevChangeFailureRateFinished]);

  useEffect(() => {
    showChart(meanTimeToRecovery.current, isDevMeanTimeToRecoveryValueListFinished, meanTimeToRecoveryDataOption);
  }, [meanTimeToRecovery, meanTimeToRecoveryDataOption, isDevMeanTimeToRecoveryValueListFinished]);

  return (
    <ChartContainer>
      {metrics.includes(RequiredData.LeadTimeForChanges) && (
        <ChartAndTitleWrapper
          trendInfo={leadTimeForChangeData.trendInfo}
          ref={leadTimeForChange}
          isLoading={!isLeadTimeForChangesFinished}
        />
      )}
      {metrics.includes(RequiredData.DeploymentFrequency) && (
        <ChartAndTitleWrapper
          trendInfo={deploymentFrequencyData.trendInfo}
          ref={deploymentFrequency}
          isLoading={!isDeploymentFrequencyFinished}
        />
      )}
      {metrics.includes(RequiredData.DevChangeFailureRate) && (
        <ChartAndTitleWrapper
          trendInfo={changeFailureRateData.trendInfo}
          ref={changeFailureRate}
          isLoading={!isDevChangeFailureRateFinished}
        />
      )}
      {metrics.includes(RequiredData.DevMeanTimeToRecovery) && (
        <ChartAndTitleWrapper
          trendInfo={meanTimeToRecoveryData.trendInfo}
          ref={meanTimeToRecovery}
          isLoading={!isDevMeanTimeToRecoveryValueListFinished}
        />
      )}
    </ChartContainer>
  );
};
