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
import { ChartContainer } from '@src/containers/MetricsStep/style';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { calculateTrendInfo } from '@src/utils/util';
import { theme } from '@src/theme';

interface DoraMetricsChartProps {
  dateRanges: string[];
  data: (ReportResponseDTO | undefined)[];
}

const NO_LABEL = '';
const LABEL_PERCENT = '%';

function extractedStackedBarData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const extractedName = mappedData?.[0].leadTimeForChangesList?.[0].valuesList
    .map((item) => LEAD_TIME_CHARTS_MAPPING[item.name])
    .slice(0, 2);
  const extractedValues = mappedData?.map((data) =>
    data.leadTimeForChangesList?.[0].valuesList.map((item) => {
      return Number(item.value);
    }),
  );
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
  const value = data?.map((item) => {
    return Number(item?.[0].valueList[0].value) || 0;
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
  const valueStr = data?.map((item) => {
    return item?.[0].valueList[0].value as string;
  });
  const value = valueStr?.map((item) => Number(item?.split('%', 1)[0]));
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
    },
    color: theme.main.doraChart.devChangeFailureRateColor,
    trendInfo,
  };
}

function extractedMeanTimeToRecoveryDataData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.devMeanTimeToRecoveryList);
  const value = data?.map((item) => {
    return Number(item?.[0].valueList[0].value) || 0;
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

export const DoraMetricsChart = ({ data, dateRanges }: DoraMetricsChartProps) => {
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
    const LeadTimeForChangeChart = echarts.init(leadTimeForChange.current);

    const option = leadTimeForChangeData && stackedBarOptionMapper(leadTimeForChangeData);
    LeadTimeForChangeChart.setOption(option);
    return () => {
      LeadTimeForChangeChart.dispose();
    };
  }, [leadTimeForChange, leadTimeForChangeData, dateRanges, mappedData]);

  useEffect(() => {
    const deploymentFrequencyChart = echarts.init(deploymentFrequency.current);
    const option = deploymentFrequencyData && oneLineOptionMapper(deploymentFrequencyData);
    deploymentFrequencyChart.setOption(option);
    return () => {
      deploymentFrequencyChart.dispose();
    };
  }, [deploymentFrequency, dateRanges, mappedData, deploymentFrequencyData]);

  useEffect(() => {
    const changeFailureRateChart = echarts.init(changeFailureRate.current);
    const option = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
    changeFailureRateChart.setOption(option);
    return () => {
      changeFailureRateChart.dispose();
    };
  }, [changeFailureRate, changeFailureRateData, dateRanges, mappedData]);

  useEffect(() => {
    const MeanTimeToRecoveryChart = echarts.init(meanTimeToRecovery.current);
    const option = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);
    MeanTimeToRecoveryChart.setOption(option);
    return () => {
      MeanTimeToRecoveryChart.dispose();
    };
  }, [meanTimeToRecovery, dateRanges, mappedData, meanTimeToRecoveryData]);

  return (
    <ChartContainer>
      <ChartAndTitleWrapper trendInfo={leadTimeForChangeData.trendInfo} ref={leadTimeForChange} />
      <ChartAndTitleWrapper trendInfo={deploymentFrequencyData.trendInfo} ref={deploymentFrequency} />
      <ChartAndTitleWrapper trendInfo={changeFailureRateData.trendInfo} ref={changeFailureRate} />
      <ChartAndTitleWrapper trendInfo={meanTimeToRecoveryData.trendInfo} ref={meanTimeToRecovery} />
    </ChartContainer>
  );
};
