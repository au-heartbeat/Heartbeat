import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

import {
  oneLineOptionMapper,
  Series,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/DoraMetricsChart/ChartOption';
import {
  ChartType,
  EMPTY_DATA_MAPPER_DORA_CHART,
  LEAD_TIME_CHARTS_MAPPING,
  RequiredData,
} from '@src/constants/resources';
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { calculateTrendInfo, percentageFormatter } from '@src/utils/util';
import { ChartContainer } from '@src/containers/MetricsStep/style';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { theme } from '@src/theme';

interface DoraMetricsChartProps {
  dateRanges: string[];
  data: (ReportResponseDTO | undefined)[];
  metrics: string[];
}

const CHART_LOADING = {
  text: '',
  color: theme.main.doraChart.loadingColor,
};

const NO_LABEL = '';
const LABEL_PERCENT = '%';
const AVERAGE = 'Average';

function extractedStackedBarData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const extractedName = mappedData?.[0].leadTimeForChangesList?.[0].valuesList
    .map((item) => LEAD_TIME_CHARTS_MAPPING[item.name])
    .slice(0, 2);
  const extractedValues = mappedData?.map((data) => {
    const averageItem = data.leadTimeForChangesList?.find((leadTimeForChange) => leadTimeForChange.name === AVERAGE);
    if (!averageItem) return [];

    return averageItem.valuesList.map((item) => Number(item.value));
  });

  const prLeadTimeValues = extractedValues?.map((value) => value![0]);
  const trendInfo = calculateTrendInfo(prLeadTimeValues, allDateRanges, ChartType.LeadTimeForChanges);

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
  const value = data?.map((items) => {
    const averageItem = items?.find((item) => item.name === AVERAGE);
    if (!averageItem) return 0;
    return Number(averageItem.valueList[0].value) || 0;
  });
  const trendInfo = calculateTrendInfo(value, allDateRanges, ChartType.DeploymentFrequency);
  return {
    legend: RequiredData.DeploymentFrequency,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Deployments/Days',
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: RequiredData.DeploymentFrequency,
      type: 'line',
      data: value!,
    },
    color: theme.main.doraChart.deploymentFrequencyChartColor,
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

  const leadTimeForChangesValuelist = mappedData
    .flatMap((value) => value.leadTimeForChangesList)
    .filter((value) => value?.name === AVERAGE)
    .map((value) => value?.valuesList);

  const isLeadTimeForChangesFinished =
    leadTimeForChangesValuelist.length === dateRanges.length &&
    leadTimeForChangesValuelist.every((value) => value?.every((it) => it.value != ''));

  const deploymentFrequencyValueList = mappedData
    .flatMap((value) => value.deploymentFrequencyList)
    .filter((value) => value?.name == AVERAGE)
    .map((value) => value?.valueList);
  const isDeploymentFrequencyFinished =
    deploymentFrequencyValueList.length == dateRanges.length &&
    deploymentFrequencyValueList.every((value) => value?.every((it) => it.value != ''));

  const devChangeFailureRateValueList = mappedData
    .flatMap((value) => value.devChangeFailureRateList)
    .filter((value) => value?.name == AVERAGE)
    .map((value) => value?.valueList);
  const isDevChangeFailureRateFinished =
    devChangeFailureRateValueList.length == dateRanges.length &&
    devChangeFailureRateValueList.every((value) => value?.every((it) => it.value != ''));

  const devMeanTimeToRecoveryValueList = mappedData
    .flatMap((value) => value.devMeanTimeToRecoveryList)
    .filter((value) => value?.name == AVERAGE)
    .map((value) => value?.valueList);
  const isDevMeanTimeToRecoveryValueListFinished =
    devMeanTimeToRecoveryValueList.length == dateRanges.length &&
    devMeanTimeToRecoveryValueList.every((value) => value?.every((it) => it.value != ''));

  const leadTimeForChangeData = extractedStackedBarData(dateRanges, mappedData);
  const deploymentFrequencyData = extractedDeploymentFrequencyData(dateRanges, mappedData);
  const changeFailureRateData = extractedChangeFailureRateData(dateRanges, mappedData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(dateRanges, mappedData);

  useEffect(() => {
    if (leadTimeForChange.current) {
      const leadTimeForChangeChart = echarts.init(leadTimeForChange.current);
      leadTimeForChangeChart.showLoading(CHART_LOADING);
      if (isLeadTimeForChangesFinished) {
        leadTimeForChangeChart.hideLoading();
        const option = leadTimeForChangeData && stackedBarOptionMapper(leadTimeForChangeData);
        leadTimeForChangeChart.setOption(option);
      }
      return () => {
        leadTimeForChangeChart.dispose();
      };
    }
  }, [leadTimeForChange, leadTimeForChangeData, dateRanges, mappedData, isLeadTimeForChangesFinished]);

  useEffect(() => {
    if (deploymentFrequency.current) {
      const deploymentFrequencyChart = echarts.init(deploymentFrequency.current);
      deploymentFrequencyChart.showLoading(CHART_LOADING);
      if (isDeploymentFrequencyFinished) {
        deploymentFrequencyChart.hideLoading();
        const option = deploymentFrequencyData && oneLineOptionMapper(deploymentFrequencyData);
        deploymentFrequencyChart.setOption(option);
      }
      return () => {
        deploymentFrequencyChart.dispose();
      };
    }
  }, [deploymentFrequency, dateRanges, mappedData, deploymentFrequencyData, isDeploymentFrequencyFinished]);

  useEffect(() => {
    if (changeFailureRate.current) {
      const changeFailureRateChart = echarts.init(changeFailureRate.current);
      changeFailureRateChart.showLoading(CHART_LOADING);
      if (isDevChangeFailureRateFinished) {
        changeFailureRateChart.hideLoading();
        const option = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
        changeFailureRateChart.setOption(option);
      }
      return () => {
        changeFailureRateChart.dispose();
      };
    }
  }, [changeFailureRate, changeFailureRateData, dateRanges, mappedData, isDevChangeFailureRateFinished]);

  useEffect(() => {
    if (meanTimeToRecovery.current) {
      const meanTimeToRecoveryChart = echarts.init(meanTimeToRecovery.current);
      meanTimeToRecoveryChart.showLoading(CHART_LOADING);
      if (isDevMeanTimeToRecoveryValueListFinished) {
        meanTimeToRecoveryChart.hideLoading();
        const option = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);
        meanTimeToRecoveryChart.setOption(option);
      }
      return () => {
        meanTimeToRecoveryChart.dispose();
      };
    }
  }, [meanTimeToRecovery, dateRanges, mappedData, meanTimeToRecoveryData, isDevMeanTimeToRecoveryValueListFinished]);

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
