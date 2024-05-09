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
  stackedAreaOptionMapper,
  Series,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/BoardMetricsChart/ChartOption';
import { ReportResponse, ReportResponseDTO, Swimlane } from '@src/clients/report/dto/response';
import { CYCLE_TIME_MAPPING, METRICS_SUBTITLE, REQUIRED_DATA } from '@src/constants/resources';
import { ChartContainer, ChartWrapper } from '@src/containers/MetricsStep/style';
import { IReportInfo } from '@src/hooks/useGenerateReportEffect';
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

interface BoardMetricsChartProps {
  // startToRequestDoraData: () => void;
  dateRanges: string[];
  data: IReportInfo[] | undefined;
}

type Result = {
  [key: string]: number[];
};

const NO_LABEL = '';
const LABEL_PERCENT = '%';

function transformArrayToObject(input: (Swimlane[] | undefined)[] | undefined) {
  const res: Result = {};

  input?.forEach((arr) => {
    arr?.forEach((item) => {
      if (!res[item.optionalItemName]) {
        res[item.optionalItemName] = new Array(input.length).fill(0);
      }
      const index = input.indexOf(arr);
      res[item.optionalItemName][index] = item.totalTime;
    });
  });

  // 删除值全为 0 的项
  Object.keys(res).forEach((key) => {
    if (res[key].every((val) => val === 0)) {
      delete res[key];
    }
  });

  return res;
}

function extractCycleTimeData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.cycleTime?.swimlaneList);
  const totalCycleTime = mappedData?.map((item) => item.cycleTime?.totalTimeForCards as number);
  const cycleTimeByStatus = transformArrayToObject(data);
  const otherIndicators = [];
  for (const [name, data] of Object.entries(cycleTimeByStatus)) {
    otherIndicators.push({ data, name: CYCLE_TIME_MAPPING[name], type: 'bar' });
  }
  return {
    title: 'Cycle Time Allocation',
    legend: 'Cycle Time Allocation',
    xAxis: dateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.DEV_MEAN_TIME_TO_RECOVERY_HOURS,
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: [
      {
        name: 'Total Cycle Time',
        type: 'bar',
        data: totalCycleTime!,
      },
      ...otherIndicators,
    ],
    color: ['#003D4F', '#47A1AD', '#F2617A'],
  };
}

function extractAverageCycleTimeData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.cycleTimeList);
  const storyPoints = data?.map((item) => item?.[0]?.valueList?.[0]?.value as number);
  const cardCount = data?.map((item) => item?.[0]?.valueList?.[1]?.value as number);
  return {
    title: 'Average Cycle Time',
    legend: 'Average Cycle Time',
    xAxis: dateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.DEV_MEAN_TIME_TO_RECOVERY_HOURS,
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: [
      {
        name: 'storyPoints',
        type: 'line',
        data: storyPoints!,
      },
      {
        name: 'cardCount',
        type: 'line',
        data: cardCount!,
      },
    ],
    color: ['#003D4F', '#47A1AD', '#F2617A'],
  };
}

function extractVelocityData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.velocityList);
  const velocity = data?.map((item) => item?.[0]?.valueList?.[0]?.value as number);
  const throughput = data?.map((item) => item?.[1]?.valueList?.[0]?.value as number);
  return {
    title: REQUIRED_DATA.VELOCITY,
    legend: REQUIRED_DATA.VELOCITY,
    xAxis: dateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.VELOCITY,
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: [
      {
        name: 'velocity',
        type: 'line',
        data: velocity!,
      },
      {
        name: 'throughput',
        type: 'line',
        data: throughput!,
      },
    ],
    color: ['#e16a7c', '#163c4d'],
  };
}

function extractReworkData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.rework);
  const totalReworkTimes = data?.map((item) => item?.totalReworkTimes as number);
  const totalReworkCards = data?.map((item) => item?.totalReworkCards as number);
  const reworkCardsRatio = data?.map((item) => item?.reworkCardsRatio as number);
  return {
    title: 'Rework',
    legend: 'Rework',
    xAxis: dateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.FAILURE_RATE,
      axisLabel: LABEL_PERCENT,
      alignTick: false,
    },
    series: [
      {
        name: 'Rework cards ratrio',
        type: 'line',
        data: reworkCardsRatio!,
      },
      {
        name: 'Total rework times',
        type: 'bar',
        data: totalReworkTimes!,
      },
      {
        name: 'Total rework cards',
        type: 'line',
        data: totalReworkCards!,
      },
    ],
    color: ['#7aa8b3', '#254456', '#d37a87'],
  };
}

interface EmptyData {
  [key: string]: any[];
}

const emptyData: EmptyData = ['velocityList', 'cycleTimeList', 'reworkList', 'classification'].reduce((obj, key) => {
  obj[key] = [];
  return obj;
}, {} as EmptyData);

export const BoardMetricsChart = ({ data, dateRanges }: BoardMetricsChartProps) => {
  const cycleTime = useRef<HTMLDivElement>(null);
  const averageCycleTime = useRef<HTMLDivElement>(null);
  const velocity = useRef<HTMLDivElement>(null);
  const rework = useRef<HTMLDivElement>(null);

  const mappedData: ReportResponse[] | undefined =
    data && data?.map((item) => (item.reportData ? reportMapper(item.reportData) : emptyData));
  const cycleTimeData = extractCycleTimeData(dateRanges, mappedData);
  const averageCycleTimeData = extractAverageCycleTimeData(dateRanges, mappedData);
  const velocityData = extractVelocityData(dateRanges, mappedData);
  const reworkData = extractReworkData(dateRanges, mappedData);

  useEffect(() => {
    const cycleTimeChart = echarts.init(cycleTime.current);
    const option = cycleTimeData && stackedBarOptionMapper(cycleTimeData);
    cycleTimeChart.setOption(option);
  }, [cycleTime, cycleTimeData]);

  useEffect(() => {
    const averageCycleTimeChart = echarts.init(averageCycleTime.current);
    const option = averageCycleTimeData && stackedAreaOptionMapper(averageCycleTimeData);
    averageCycleTimeChart.setOption(option);
  }, [averageCycleTime, averageCycleTimeData]);

  useEffect(() => {
    const velocityChart = echarts.init(velocity.current);
    const option = velocityData && stackedAreaOptionMapper(velocityData);
    velocityChart.setOption(option);
  }, [velocity, velocityData]);

  useEffect(() => {
    const reworkChart = echarts.init(rework.current);
    const option = reworkData && stackedAreaOptionMapper(reworkData);
    reworkChart.setOption(option);
  }, [rework, reworkData]);

  return (
    <>
      <ChartContainer>
        <ChartWrapper ref={averageCycleTime}></ChartWrapper>
        <ChartWrapper ref={velocity}></ChartWrapper>
      </ChartContainer>
      <ChartContainer>
        <ChartWrapper ref={rework}></ChartWrapper>
        <ChartWrapper ref={cycleTime}></ChartWrapper>
      </ChartContainer>
    </>
  );
};
