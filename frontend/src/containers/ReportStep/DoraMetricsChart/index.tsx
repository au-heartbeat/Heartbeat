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

  const leadTimeForChangeData = extractedStackedBarData(dateRanges, mappedData);
  const deploymentFrequencyData = extractedDeploymentFrequencyData(dateRanges, mappedData);
  const changeFailureRateData = extractedChangeFailureRateData(dateRanges, mappedData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(dateRanges, mappedData);
  useEffect(() => {
    const LeadTimeForChangeChart = leadTimeForChange.current && echarts.init(leadTimeForChange.current);

    const option = leadTimeForChangeData && stackedBarOptionMapper(leadTimeForChangeData);
    LeadTimeForChangeChart && LeadTimeForChangeChart.setOption(option);
    return () => {
      LeadTimeForChangeChart && LeadTimeForChangeChart.dispose();
    };
  }, [leadTimeForChange, leadTimeForChangeData, dateRanges, mappedData]);

  useEffect(() => {
    const deploymentFrequencyChart = deploymentFrequency.current && echarts.init(deploymentFrequency.current);
    const option = deploymentFrequencyData && oneLineOptionMapper(deploymentFrequencyData);
    deploymentFrequencyChart && deploymentFrequencyChart.setOption(option);
    return () => {
      deploymentFrequencyChart && deploymentFrequencyChart.dispose();
    };
  }, [deploymentFrequency, dateRanges, mappedData, deploymentFrequencyData]);

  useEffect(() => {
    const changeFailureRateChart = changeFailureRate.current && echarts.init(changeFailureRate.current);
    const option = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
    changeFailureRateChart && changeFailureRateChart.setOption(option);
    return () => {
      changeFailureRateChart && changeFailureRateChart.dispose();
    };
  }, [changeFailureRate, changeFailureRateData, dateRanges, mappedData]);

  useEffect(() => {
    const MeanTimeToRecoveryChart = meanTimeToRecovery.current && echarts.init(meanTimeToRecovery.current);
    const option = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);
    MeanTimeToRecoveryChart && MeanTimeToRecoveryChart.setOption(option);
    return () => {
      MeanTimeToRecoveryChart && MeanTimeToRecoveryChart.dispose();
    };
  }, [meanTimeToRecovery, dateRanges, mappedData, meanTimeToRecoveryData]);

  return (
    <ChartContainer>
      {metrics.includes(RequiredData.LeadTimeForChanges) && (
        <ChartAndTitleWrapper trendInfo={leadTimeForChangeData.trendInfo} ref={leadTimeForChange} />
      )}
      {metrics.includes(RequiredData.DeploymentFrequency) && (
        <ChartAndTitleWrapper trendInfo={deploymentFrequencyData.trendInfo} ref={deploymentFrequency} />
      )}
      {metrics.includes(RequiredData.DevChangeFailureRate) && (
        <ChartAndTitleWrapper trendInfo={changeFailureRateData.trendInfo} ref={changeFailureRate} />
      )}
      {metrics.includes(RequiredData.DevMeanTimeToRecovery) && (
        <ChartAndTitleWrapper trendInfo={meanTimeToRecoveryData.trendInfo} ref={meanTimeToRecovery} />
      )}
    </ChartContainer>
  );
};
