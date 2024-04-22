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
  BarOptionProps,
  LineOptionProps,
  oneLineOptionMapper,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/DoraMetricsChart/ChartOption';
import { ChartContainer, ChartWrapper } from '@src/containers/MetricsStep/style';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { CanvasRenderer } from 'echarts/renderers';

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
  doraReport?: ReportResponseDTO;
  errorMessage: string;
}

const mockLTFCdata: BarOptionProps = {
  title: 'Lead Time For Change',
  legend: 'Lead Time For Change',
  xAxis: ['03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15'],
  yAxis: {
    name: 'Hours',
    alignTick: false,
  },
  series: [
    {
      name: 'PR Lead Time',
      type: 'bar',
      data: [7, 4, 6, 11, 5, 1],
    },
    {
      name: 'Pipeline Lead Time',
      type: 'bar',
      data: [7, 4, 6, 11, 5, 1],
    },
    {
      name: 'Total Lead Time',
      type: 'bar',
      data: [7, 4, 6, 11, 5, 1],
    },
  ],
  color: ['#003D4F', '#47A1AD', '#F2617A'],
};

const mockDFdata: LineOptionProps = {
  title: 'Deployment Frequency',
  legend: 'Deployment Frequency',
  xAxis: ['03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15'],
  yAxis: {
    name: 'Deployments/Days',
    alignTick: false,
  },
  series: {
    name: 'Deployment Frequency',
    type: 'line',
    data: [7, 4, 6, 11, 5, 1],
  },
  color: '#F2617A',
};

const mockCFRCdata: LineOptionProps = {
  title: 'Change Failure Rate',
  legend: 'Change Failure Rate',
  xAxis: ['03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15'],
  yAxis: {
    name: '',
    alignTick: false,
  },
  series: {
    name: 'Change Failure Rate',
    type: 'line',
    data: [10 / 14, 4 / 5, 6 / 77, 11 / 35, 5 / 44, 1 / 6],
  },
  color: '#003D4F',
};

const mockNTTRdata: LineOptionProps = {
  title: 'Mean Time To Recovery',
  legend: 'Mean Time To Recovery',
  xAxis: ['03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15', '03/01-03/15'],
  yAxis: {
    name: 'Hours',
    alignTick: false,
  },
  series: {
    name: 'Mean Time To Recovery',
    type: 'line',
    data: [7, 4, 6, 11, 5, 1],
  },
  color: '#634F7D',
};

export const DoraMetricsChart = ({ startToRequestBoardData, boardReport, errorMessage }: DoraMetricsChartProps) => {
  const LeadTimeForChange = useRef<HTMLDivElement>(null);
  const deploymentFrequency = useRef<HTMLDivElement>(null);
  const changeFailureRate = useRef<HTMLDivElement>(null);
  const MeanTimeToRecovery = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const LeadTimeForChangeChart = echarts.init(LeadTimeForChange.current);
    const option = mockLTFCdata && stackedBarOptionMapper(mockLTFCdata);
    LeadTimeForChangeChart.setOption(option);
  }, [LeadTimeForChange]);

  useEffect(() => {
    const deploymentFrequencyChart = echarts.init(deploymentFrequency.current);
    const option = mockDFdata && oneLineOptionMapper(mockDFdata);
    deploymentFrequencyChart.setOption(option);
  }, [deploymentFrequency]);

  useEffect(() => {
    const changeFailureRateChart = echarts.init(changeFailureRate.current);
    const option = mockCFRCdata && oneLineOptionMapper(mockCFRCdata);
    changeFailureRateChart.setOption(option);
  }, [changeFailureRate]);

  useEffect(() => {
    const MeanTimeToRecoveryChart = echarts.init(MeanTimeToRecovery.current);
    const option = mockNTTRdata && oneLineOptionMapper(mockNTTRdata);
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
