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
import { reportMapper } from '@src/hooks/reportMapper/report';
import { CanvasRenderer } from 'echarts/renderers';
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
  data: ReportResponseDTO;
  errorMessage: string;
}

function extractedStackedBarData(mappedData: ReportResponse) {
  return {
    title: 'Lead Time For Change',
    legend: 'Lead Time For Change',
    xAxis: ['03/01-03/15'],
    yAxis: {
      name: METRICS_SUBTITLE.DEV_MEAN_TIME_TO_RECOVERY_HOURS,
      alignTick: false,
    },
    series: mappedData.leadTimeForChangesList?.[0].valuesList.map((item) => {
      const series: Series = {
        name: item.name,
        type: 'bar',
        data: [toNumber(item.value)],
      };

      return series;
    }),
    color: ['#003D4F', '#47A1AD', '#F2617A'],
  };
}

function extractedDeploymentFrequencyData(mappedData: ReportResponse) {
  const data = mappedData.deploymentFrequencyList;
  const value = data?.[0].valueList[0].value as number;
  return {
    title: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
    legend: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
    xAxis: ['03/01-03/15'],
    yAxis: {
      name: METRICS_SUBTITLE.DEPLOYMENT_FREQUENCY,
      data: [`${value}%`],
      alignTick: false,
    },
    series: {
      name: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
      type: 'line',
      data: [value],
    },
    color: '#F2617A',
  };
}

function extractedChangeFailureRateData(mappedData: ReportResponse) {
  const data = mappedData.devChangeFailureRateList;
  const valueStr = data?.[0].valueList[0].value as string;
  const value = toNumber(valueStr.split('%', 1)[0]);
  return {
    title: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
    legend: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
    xAxis: ['03/01-03/15'],
    yAxis: {
      name: METRICS_SUBTITLE.FAILURE_RATE,
      data: [`${value}%`],
      alignTick: false,
    },
    series: {
      name: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
      type: 'line',
      data: [value],
    },
    color: '#003D4F',
  };
}

function extractedMeanTimeToRecoveryDataData(mappedData: ReportResponse) {
  const data = mappedData.devMeanTimeToRecoveryList;
  const value = data?.[0].valueList[0].value as number;
  return {
    title: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
    legend: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
    xAxis: ['03/01-03/15'],
    yAxis: {
      name: METRICS_SUBTITLE.DEV_MEAN_TIME_TO_RECOVERY_HOURS,
      data: [`${value}%`],
      alignTick: false,
    },
    series: {
      name: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
      type: 'line',
      data: [value],
    },
    color: '#634F7D',
  };
}

export const DoraMetricsChart = ({ startToRequestBoardData, data, errorMessage }: DoraMetricsChartProps) => {
  const LeadTimeForChange = useRef<HTMLDivElement>(null);
  const deploymentFrequency = useRef<HTMLDivElement>(null);
  const changeFailureRate = useRef<HTMLDivElement>(null);
  const MeanTimeToRecovery = useRef<HTMLDivElement>(null);

  const mappedData: ReportResponse = reportMapper(data);
  const LeadTimeForChangeData = extractedStackedBarData(mappedData);
  const deploymentFrequencyData = extractedDeploymentFrequencyData(mappedData);
  const changeFailureRateData = extractedChangeFailureRateData(mappedData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(mappedData);

  useEffect(() => {
    const LeadTimeForChangeChart = echarts.init(LeadTimeForChange.current);
    const option = LeadTimeForChangeData && stackedBarOptionMapper(LeadTimeForChangeData);
    LeadTimeForChangeChart.setOption(option);
  }, [LeadTimeForChange]);

  useEffect(() => {
    const deploymentFrequencyChart = echarts.init(deploymentFrequency.current);
    const option = deploymentFrequencyData && oneLineOptionMapper(deploymentFrequencyData);
    deploymentFrequencyChart.setOption(option);
  }, [deploymentFrequency]);

  useEffect(() => {
    const changeFailureRateChart = echarts.init(changeFailureRate.current);
    const option = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
    changeFailureRateChart.setOption(option);
  }, [changeFailureRate]);

  useEffect(() => {
    const MeanTimeToRecoveryChart = echarts.init(MeanTimeToRecovery.current);
    const option = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);
    MeanTimeToRecoveryChart.setOption(option);
  }, [MeanTimeToRecovery]);

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
