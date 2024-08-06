import React, { useEffect, useRef } from 'react';

import {
  ChartType,
  emptyDataMapperDoraChart,
  LEAD_TIME_CHARTS_MAPPING,
  MetricsSubtitle,
  RequiredData,
} from '@src/constants/resources';
import {
  oneLineOptionMapper,
  Series,
  stackedBarOptionMapper,
  stackedAreaOptionMapper,
} from '@src/containers/ReportStep/ChartOption';
import {
  AREA_STYLE,
  LABEL_PERCENT,
  LEFT_RIGHT_ALIGN_LABEL,
  NO_LABEL,
} from '@src/containers/ReportStep/BoardMetricsChart';
import PipelineSelector from '@src/containers/ReportStep/DoraMetricsChart/PipelineSelector';
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
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
  allPipelines: string[];
  selectedPipeline: string;
  onUpdatePipeline: (value: string) => void;
  allDateRangeLoadingFinished: boolean;
}

enum DORAMetricsChartType {
  LeadTimeForChanges = 'leadTimeForChangesList',
  DeploymentFrequency = 'deploymentFrequencyList',
  PipelineChangeFailureRate = 'pipelineChangeFailureRateList',
  PipelineMeanTimeToRecovery = 'pipelineMeanTimeToRecoveryList',
}

const AVERAGE = 'Average';
const TOTAL = 'Total';
export const DEFAULT_SELECTED_PIPELINE = 'All';

function extractedStackedBarData(
  allDateRanges: string[],
  mappedData: ReportResponse[] | undefined,
  selectedPipeline: string,
) {
  const extractedName = mappedData?.[0].leadTimeForChangesList?.[0].valueList
    .map((item) => LEAD_TIME_CHARTS_MAPPING[item.name])
    .slice(0, 2);
  const extractedValues = mappedData?.map((data) => {
    const averageItem = data.leadTimeForChangesList?.find((leadTimeForChange) =>
      selectedPipeline === DEFAULT_SELECTED_PIPELINE
        ? leadTimeForChange.name === AVERAGE
        : leadTimeForChange.name === selectedPipeline,
    );
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

function extractedDeploymentFrequencyData(
  allDateRanges: string[],
  mappedData: ReportResponse[] | undefined,
  selectedPipeline: string,
) {
  const data = mappedData?.map((item) => item.deploymentFrequencyList);
  const averageDeploymentFrequency = data?.map((items) => {
    const averageItem = items?.find((item) =>
      selectedPipeline === DEFAULT_SELECTED_PIPELINE ? item.name === AVERAGE : item.name === selectedPipeline,
    );
    if (!averageItem) return 0;
    return Number(averageItem.valueList[0].value) || 0;
  });
  const deployTimes = data?.map((items) => {
    const averageItem = items?.find((item) =>
      selectedPipeline === DEFAULT_SELECTED_PIPELINE ? item.name === AVERAGE : item.name === selectedPipeline,
    );
    if (!averageItem) return 0;
    return Number(averageItem.valueList[1].value);
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
        name: MetricsSubtitle.DeploymentFrequency,
        alignTick: false,
        axisLabel: NO_LABEL,
      },
      {
        name: MetricsSubtitle.DeploymentTimes,
        alignTick: false,
        axisLabel: NO_LABEL,
      },
    ],
    series: [
      {
        name: MetricsSubtitle.DeploymentFrequency,
        type: 'line',
        data: averageDeploymentFrequency!,
        yAxisIndex: 0,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
      {
        name: MetricsSubtitle.DeploymentTimes,
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

function extractedChangeFailureRateData(
  allDateRanges: string[],
  mappedData: ReportResponse[] | undefined,
  selectedPipeline: string,
) {
  const data = mappedData?.map((item) => item.pipelineChangeFailureRateList);
  const value = data?.map((items) => {
    const averageItem = items?.find((item) =>
      selectedPipeline === DEFAULT_SELECTED_PIPELINE ? item.name === AVERAGE : item.name === selectedPipeline,
    );
    if (!averageItem) return 0;
    const originValue: string | number = averageItem.valueList[0].value;
    const value: number = Number(`${originValue}`.split('%')[0]);
    return value || 0;
  });
  const trendInfo = calculateTrendInfo(value, allDateRanges, ChartType.PipelineChangeFailureRate);
  return {
    legend: RequiredData.PipelineChangeFailureRate,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Failed/Total',
      axisLabel: LABEL_PERCENT,
      alignTick: false,
    },
    series: {
      name: RequiredData.PipelineChangeFailureRate,
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

function extractedMeanTimeToRecoveryDataData(
  allDateRanges: string[],
  mappedData: ReportResponse[] | undefined,
  selectedPipeline: string,
) {
  const data = mappedData?.map((item) => item.pipelineMeanTimeToRecoveryList);
  const value = data?.map((items) => {
    const totalItem = items?.find((item) =>
      selectedPipeline === DEFAULT_SELECTED_PIPELINE ? item.name === TOTAL : item.name === selectedPipeline,
    );
    if (!totalItem) return 0;
    return Number(totalItem.valueList[0].value) || 0;
  });
  const trendInfo = calculateTrendInfo(value, allDateRanges, ChartType.PipelineMeanTimeToRecovery);
  return {
    legend: RequiredData.PipelineMeanTimeToRecovery,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Hours',
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: RequiredData.PipelineMeanTimeToRecovery,
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
        pipelineChangeFailureRateList: ChartValueSource[];
        pipelineMeanTimeToRecoveryList: ChartValueSource[];
        exportValidityTimeMin: number;
        leadTimeForChangesList: ChartValueSource[];
      }
  )[];
  type: DORAMetricsChartType;
}): boolean {
  const valueList = mappedData
    .flatMap((value) => value[type] as unknown as ChartValueSource[])
    .filter((value) =>
      type === DORAMetricsChartType.PipelineMeanTimeToRecovery ? value?.name === TOTAL : value?.name === AVERAGE,
    )
    .map((value) => value?.valueList);

  return (
    valueList.length === dateRangeLength && valueList.every((value) => value?.every((it) => it.value != EMPTY_STRING))
  );
}

export const DoraMetricsChart = ({
  data,
  dateRanges,
  metrics,
  selectedPipeline,
  onUpdatePipeline,
  allPipelines,
  allDateRangeLoadingFinished,
}: DoraMetricsChartProps) => {
  const leadTimeForChange = useRef<HTMLDivElement>(null);
  const deploymentFrequency = useRef<HTMLDivElement>(null);
  const changeFailureRate = useRef<HTMLDivElement>(null);
  const meanTimeToRecovery = useRef<HTMLDivElement>(null);

  const mappedData = data.map((currentData) => {
    if (!currentData?.doraMetricsCompleted) {
      return emptyDataMapperDoraChart(allPipelines, '');
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
    type: DORAMetricsChartType.PipelineChangeFailureRate,
  });
  const isDevMeanTimeToRecoveryValueListFinished: boolean = isDoraMetricsChartFinish({
    dateRangeLength,
    mappedData,
    type: DORAMetricsChartType.PipelineMeanTimeToRecovery,
  });

  const leadTimeForChangeData = extractedStackedBarData(dateRanges, mappedData, selectedPipeline);
  const leadTimeForChangeDataOption = leadTimeForChangeData && stackedBarOptionMapper(leadTimeForChangeData, false);
  const deploymentFrequencyData = extractedDeploymentFrequencyData(dateRanges, mappedData, selectedPipeline);
  const deploymentFrequencyDataOption = deploymentFrequencyData && stackedAreaOptionMapper(deploymentFrequencyData);
  const changeFailureRateData = extractedChangeFailureRateData(dateRanges, mappedData, selectedPipeline);
  const changeFailureRateDataOption = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(dateRanges, mappedData, selectedPipeline);
  const meanTimeToRecoveryDataOption = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);

  useEffect(() => {
    showChart(leadTimeForChange.current, leadTimeForChangeDataOption);
  }, [leadTimeForChange, leadTimeForChangeDataOption]);

  useEffect(() => {
    showChart(deploymentFrequency.current, deploymentFrequencyDataOption);
  }, [deploymentFrequency, deploymentFrequencyDataOption]);

  useEffect(() => {
    showChart(changeFailureRate.current, changeFailureRateDataOption);
  }, [changeFailureRate, changeFailureRateDataOption]);

  useEffect(() => {
    showChart(meanTimeToRecovery.current, meanTimeToRecoveryDataOption);
  }, [meanTimeToRecovery, meanTimeToRecoveryDataOption]);

  const pipelineNameOptions = [DEFAULT_SELECTED_PIPELINE, ...allPipelines];

  return (
    <>
      <PipelineSelector
        options={pipelineNameOptions}
        value={selectedPipeline}
        onUpDatePipeline={(value) => onUpdatePipeline(value)}
        title={'Pipeline/Step'}
      />
      <ChartContainer>
        {metrics.includes(RequiredData.LeadTimeForChanges) && (
          <ChartAndTitleWrapper
            trendInfo={leadTimeForChangeData.trendInfo}
            ref={leadTimeForChange}
            isLoading={!isLeadTimeForChangesFinished && !allDateRangeLoadingFinished}
          />
        )}
        {metrics.includes(RequiredData.DeploymentFrequency) && (
          <ChartAndTitleWrapper
            trendInfo={deploymentFrequencyData.trendInfo}
            ref={deploymentFrequency}
            isLoading={!isDeploymentFrequencyFinished && !allDateRangeLoadingFinished}
          />
        )}
        {metrics.includes(RequiredData.PipelineChangeFailureRate) && (
          <ChartAndTitleWrapper
            trendInfo={changeFailureRateData.trendInfo}
            ref={changeFailureRate}
            isLoading={!isDevChangeFailureRateFinished && !allDateRangeLoadingFinished}
          />
        )}
        {metrics.includes(RequiredData.PipelineMeanTimeToRecovery) && (
          <ChartAndTitleWrapper
            trendInfo={meanTimeToRecoveryData.trendInfo}
            ref={meanTimeToRecovery}
            isLoading={!isDevMeanTimeToRecoveryValueListFinished && !allDateRangeLoadingFinished}
          />
        )}
      </ChartContainer>
    </>
  );
};
