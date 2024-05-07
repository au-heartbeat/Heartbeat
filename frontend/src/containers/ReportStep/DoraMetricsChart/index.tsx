import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';
import { BarChart, LineChart } from 'echarts/charts';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';

import {
  oneLineOptionMapper,
  Series,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/DoraMetricsChart/ChartOption';
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import { ChartContainer, ChartWrapper } from '@src/containers/MetricsStep/style';
import { METRICS_SUBTITLE, REQUIRED_DATA } from '@src/constants/resources';
import { selectConfig } from '@src/context/config/configSlice';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { CanvasRenderer } from 'echarts/renderers';
import { useAppSelector } from '@src/hooks';
import { toNumber } from 'lodash';

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent,
]);

interface DoraMetricsChartProps {
  startToRequestDoraData: () => void;
  data: (ReportResponseDTO | undefined)[];
}

const NO_LABEL = '';
const LABEL_PERCENT = '%';

function formatDate(date: string) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [month, day].join('/');
}

function extractedStackedBarData(allDateRanges: string[], mappedData?: ReportResponse[]) {
  const extractedName = mappedData?.[0].leadTimeForChangesList?.[0].valuesList.map((item) => item.name);
  const extractedValues = mappedData?.map((data) => {
    return data.leadTimeForChangesList?.[0].valuesList.map((item) => item.value);
  });

  return {
    title: 'Lead Time For Change',
    legend: 'Lead Time For Change',
    xAxis: allDateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.DEV_MEAN_TIME_TO_RECOVERY_HOURS,
      alignTick: false,
      axisLabel: NO_LABEL,
    },

    series: extractedName?.map((name, index) => {
      const series: Series = {
        name: name,
        type: 'bar',
        data: extractedValues!.map((value) => toNumber(value![index])),
      };
      return series;
    }),

    color: ['#003D4F', '#47A1AD', '#F2617A'],
  };
}

function extractedDeploymentFrequencyData(allDateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.deploymentFrequencyList);
  const value = data?.map((item) => item?.[0].valueList[0].value as number);
  return {
    title: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
    legend: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
    xAxis: allDateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.DEPLOYMENT_FREQUENCY,
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
      type: 'line',
      data: value!,
    },
    color: '#F2617A',
  };
}

function extractedChangeFailureRateData(allDateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.devChangeFailureRateList);
  const valueStr = data?.map((item) => item?.[0].valueList[0].value as string);
  const value = valueStr?.map((item) => toNumber(item?.split('%', 1)[0]));
  return {
    title: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
    legend: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
    xAxis: allDateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.FAILURE_RATE,
      axisLabel: LABEL_PERCENT,
      alignTick: false,
    },
    series: {
      name: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
      type: 'line',
      data: value!,
    },
    color: '#003D4F',
  };
}

function extractedMeanTimeToRecoveryDataData(allDateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.devMeanTimeToRecoveryList);
  const value = data?.map((item) => item?.[0].valueList[0].value as number);
  return {
    title: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
    legend: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
    xAxis: allDateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.DEV_MEAN_TIME_TO_RECOVERY_HOURS,
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
      type: 'line',
      data: value!,
    },
    color: '#634F7D',
  };
}

export const DoraMetricsChart = ({ data }: DoraMetricsChartProps) => {
  const configData = useAppSelector(selectConfig);
  const dateRange = configData.basic.dateRange;

  const allDateRanges = dateRange?.map((date) => {
    return formatDate(date.startDate!) + '-' + formatDate(date!.endDate!);
  });

  const LeadTimeForChange = useRef<HTMLDivElement>(null);
  const deploymentFrequency = useRef<HTMLDivElement>(null);
  const changeFailureRate = useRef<HTMLDivElement>(null);
  const MeanTimeToRecovery = useRef<HTMLDivElement>(null);

  //TODO: filter valid report data here:
  const mappedData = data && data.map((currentData) => reportMapper(currentData!));

  const deploymentFrequencyData = extractedDeploymentFrequencyData(allDateRanges, mappedData);
  const changeFailureRateData = extractedChangeFailureRateData(allDateRanges, mappedData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(allDateRanges, mappedData);
  const LeadTimeForChangeData = extractedStackedBarData(allDateRanges, mappedData);

  useEffect(() => {
    const LeadTimeForChangeChart = echarts.init(LeadTimeForChange.current);
    const option = LeadTimeForChangeData && stackedBarOptionMapper(LeadTimeForChangeData);
    LeadTimeForChangeChart.setOption(option);
  }, [LeadTimeForChange, LeadTimeForChangeData]);

  useEffect(() => {
    const deploymentFrequencyChart = echarts.init(deploymentFrequency.current);
    const option = deploymentFrequencyData && oneLineOptionMapper(deploymentFrequencyData);
    deploymentFrequencyChart.setOption(option);
  }, [deploymentFrequency, deploymentFrequencyData]);

  useEffect(() => {
    const changeFailureRateChart = echarts.init(changeFailureRate.current);
    const option = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
    changeFailureRateChart.setOption(option);
  }, [changeFailureRate, changeFailureRateData]);

  useEffect(() => {
    const MeanTimeToRecoveryChart = echarts.init(MeanTimeToRecovery.current);
    const option = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);
    MeanTimeToRecoveryChart.setOption(option);
  }, [MeanTimeToRecovery, meanTimeToRecoveryData]);

  return (
    <>
      <ChartContainer>
        <ChartWrapper ref={LeadTimeForChange}></ChartWrapper>
        <ChartWrapper ref={deploymentFrequency}></ChartWrapper>
      </ChartContainer>
      <ChartContainer>
        <ChartWrapper ref={changeFailureRate}></ChartWrapper>
        <ChartWrapper ref={MeanTimeToRecovery}></ChartWrapper>
      </ChartContainer>
    </>
  );
};
