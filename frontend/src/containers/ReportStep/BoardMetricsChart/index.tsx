import {
  stackedAreaOptionMapper,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/BoardMetricsChart/ChartOption';
import { CHART_TYPE, CYCLE_TIME_CHARTS_MAPPING, METRICS_CONSTANTS } from '@src/constants/resources';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { calculateTrendInfo, xAxisLabelDateFormatter } from '@src/utils/util';
import { ReportResponse, Swimlane } from '@src/clients/report/dto/response';
import { ChartContainer } from '@src/containers/MetricsStep/style';
import { IReportInfo } from '@src/hooks/useGenerateReportEffect';
import { reportMapper } from '@src/hooks/reportMapper/report';
import React, { useEffect, useRef } from 'react';
import { theme } from '@src/theme';
import * as echarts from 'echarts';

interface BoardMetricsChartProps {
  dateRanges: string[];
  data: IReportInfo[] | undefined;
}

type Result = {
  [key: string]: number[];
};

const NO_LABEL = '';
const LABEL_PERCENT = '%';

const AREA_STYLE = {
  opacity: 0.3,
};

const LEFT_RIGHT_ALIGN_LABEL = {
  color: 'black',
  alignMaxLabel: 'right',
  alignMinLabel: 'left',
  formatter: xAxisLabelDateFormatter,
};

const CENTER_ALIGN_LABEL = {
  color: 'black',
  alignMaxLabel: 'center',
  alignMinLabel: 'center',
  formatter: xAxisLabelDateFormatter,
};

function transformArrayToObject(input: (Swimlane[] | undefined)[] | undefined, totalCycleTime: number[]) {
  const res: Result = {};

  input?.forEach((arr, idx) => {
    arr?.forEach((item) => {
      if (!res[item.optionalItemName]) {
        res[item.optionalItemName] = new Array(input.length).fill(0);
      }
      const index = input.indexOf(arr);
      res[item.optionalItemName][index] = Number((100 * (item.totalTime / totalCycleTime[idx])).toFixed(2));
    });
  });

  return res;
}

function extractVelocityData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.velocityList);
  const velocity = data?.map((item) => item?.[0]?.valueList?.[0]?.value as number);
  const throughput = data?.map((item) => item?.[1]?.valueList?.[0]?.value as number);
  const trendInfo = calculateTrendInfo(velocity, dateRanges, CHART_TYPE.VELOCITY);
  return {
    xAxis: {
      data: dateRanges,
      boundaryGap: false,
      axisLabel: LEFT_RIGHT_ALIGN_LABEL,
    },
    yAxis: [
      {
        name: 'Story point',
        alignTick: false,
        axisLabel: NO_LABEL,
      },
      {
        name: 'Card',
        alignTick: false,
        axisLabel: NO_LABEL,
      },
    ],
    series: [
      {
        name: 'Velocity(Story point)',
        type: 'line',
        data: velocity!,
        yAxisIndex: 0,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
      {
        name: 'Throughput(Cards count)',
        type: 'line',
        data: throughput!,
        yAxisIndex: 1,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
    ],
    color: [theme.main.boardChart.lineColorA, theme.main.boardChart.lineColorB],
    trendInfo,
  };
}

function extractAverageCycleTimeData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.cycleTimeList);
  const storyPoints = data?.map((item) => item?.[0]?.valueList?.[0]?.value as number);
  const cardCount = data?.map((item) => item?.[0]?.valueList?.[1]?.value as number);
  const trendInfo = calculateTrendInfo(storyPoints, dateRanges, CHART_TYPE.AVERAGE_CYCLE_TIME);
  return {
    xAxis: {
      data: dateRanges,
      boundaryGap: false,
      axisLabel: LEFT_RIGHT_ALIGN_LABEL,
    },
    yAxis: [
      {
        name: 'Days/Story point',
        alignTick: false,
        axisLabel: NO_LABEL,
      },
      {
        name: 'Days/Card',
        alignTick: false,
        axisLabel: NO_LABEL,
      },
    ],
    series: [
      {
        name: 'Days/Story point',
        type: 'line',
        data: storyPoints!,
        yAxisIndex: 0,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
      {
        name: 'Days/Cards count',
        type: 'line',
        data: cardCount!,
        yAxisIndex: 1,
        smooth: true,
        areaStyle: AREA_STYLE,
      },
    ],
    color: [theme.main.boardChart.lineColorA, theme.main.boardChart.lineColorB],
    trendInfo,
  };
}

function extractCycleTimeData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.cycleTime?.swimlaneList);
  const totalCycleTime = mappedData?.map((item) => item.cycleTime?.totalTimeForCards as number);
  const cycleTimeByStatus = transformArrayToObject(data, totalCycleTime!);
  const indicators = [];
  for (const [name, data] of Object.entries(cycleTimeByStatus)) {
    indicators.push({ data, name: CYCLE_TIME_CHARTS_MAPPING[name], type: 'bar' });
  }
  const developmentPercentageList = indicators.find(
    ({ name }) => name === CYCLE_TIME_CHARTS_MAPPING[METRICS_CONSTANTS.inDevValue],
  )?.data;
  const trendInfo = calculateTrendInfo(developmentPercentageList, dateRanges, CHART_TYPE.CYCLE_TIME_ALLOCATION);

  return {
    xAxis: dateRanges,
    yAxis: {
      name: 'Value/Total cycle time',
      alignTick: false,
      axisLabel: LABEL_PERCENT,
    },
    series: indicators,
    color: [
      theme.main.boardChart.barColorA,
      theme.main.boardChart.barColorB,
      theme.main.boardChart.barColorC,
      theme.main.boardChart.barColorD,
      theme.main.boardChart.barColorE,
      theme.main.boardChart.barColorF,
    ],
    trendInfo,
  };
}

function extractReworkData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.rework);
  const totalReworkTimes = data?.map((item) => item?.totalReworkTimes as number);
  const totalReworkCards = data?.map((item) => item?.totalReworkCards as number);
  const reworkCardsRatio = data?.map((item) => (item?.reworkCardsRatio as number) * 100);

  const trendInfo = calculateTrendInfo(totalReworkTimes, dateRanges, CHART_TYPE.REWORK);
  return {
    xAxis: {
      data: dateRanges,
      boundaryGap: true,
      axisLabel: CENTER_ALIGN_LABEL,
    },
    yAxis: [
      {
        name: '',
        alignTick: false,
        axisLabel: NO_LABEL,
      },
      {
        name: '',
        alignTick: false,
        axisLabel: LABEL_PERCENT,
      },
    ],
    series: [
      {
        name: 'Rework cards ratio',
        type: 'line',
        tooltip: {
          valueFormatter: function (value: number) {
            if (isNaN(value)) {
              return '-';
            }
            return value.toFixed(2) + ' %';
          },
        },
        data: reworkCardsRatio!,
        yAxisIndex: 1,
        setAreaStyle: false,
        smooth: false,
      },
      {
        name: 'Total rework times',
        type: 'bar',
        data: totalReworkTimes!,
        yAxisIndex: 0,
        setAreaStyle: false,
        smooth: false,
      },
      {
        name: 'Total rework cards',
        type: 'bar',
        data: totalReworkCards!,
        yAxisIndex: 0,
        setAreaStyle: false,
        smooth: false,
      },
    ],
    color: [theme.main.boardChart.lineColorB, theme.main.boardChart.barColorA, theme.main.boardChart.barColorB],
    trendInfo,
  };
}

interface EmptyData {
  [key: string]: unknown[];
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
    data && data.map((item) => (item.reportData?.boardMetricsCompleted ? reportMapper(item.reportData) : emptyData));

  const cycleTimeData = extractCycleTimeData(dateRanges, mappedData);
  const averageCycleTimeData = extractAverageCycleTimeData(dateRanges, mappedData);
  const velocityData = extractVelocityData(dateRanges, mappedData);
  const reworkData = extractReworkData(dateRanges, mappedData);

  useEffect(() => {
    const velocityChart = echarts.init(velocity.current);
    const option = velocityData && stackedAreaOptionMapper(velocityData);
    velocityChart.setOption(option);
    return () => {
      velocityChart.dispose();
    };
  }, [velocity, velocityData]);

  useEffect(() => {
    const averageCycleTimeChart = echarts.init(averageCycleTime.current);
    const option = averageCycleTimeData && stackedAreaOptionMapper(averageCycleTimeData);
    averageCycleTimeChart.setOption(option);
    return () => {
      averageCycleTimeChart.dispose();
    };
  }, [averageCycleTime, averageCycleTimeData]);

  useEffect(() => {
    const cycleTimeChart = echarts.init(cycleTime.current);
    const option = cycleTimeData && stackedBarOptionMapper(cycleTimeData);
    cycleTimeChart.setOption(option);
    return () => {
      cycleTimeChart.dispose();
    };
  }, [cycleTime, cycleTimeData]);

  useEffect(() => {
    const reworkChart = echarts.init(rework.current);
    const option = reworkData && stackedAreaOptionMapper(reworkData);
    reworkChart.setOption(option);
    return () => {
      reworkChart.dispose();
    };
  }, [rework, reworkData]);

  return (
    <ChartContainer>
      <ChartAndTitleWrapper trendInfo={velocityData.trendInfo} ref={velocity} />
      <ChartAndTitleWrapper trendInfo={averageCycleTimeData.trendInfo} ref={averageCycleTime} />
      <ChartAndTitleWrapper trendInfo={cycleTimeData.trendInfo} ref={cycleTime} />
      <ChartAndTitleWrapper trendInfo={reworkData.trendInfo} ref={rework} />
    </ChartContainer>
  );
};
