import {
  stackedAreaOptionMapper,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/BoardMetricsChart/ChartOption';
import { ChartType, CYCLE_TIME_CHARTS_MAPPING, METRICS_CONSTANTS, RequiredData } from '@src/constants/resources';
import { calculateTrendInfo, valueFormatter, xAxisLabelDateFormatter } from '@src/utils/util';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { ReportResponse, Swimlane } from '@src/clients/report/dto/response';
import { ChartContainer } from '@src/containers/MetricsStep/style';
import { IReportInfo } from '@src/hooks/useGenerateReportEffect';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { CHART_LOADING } from '@src/containers/ReportStep';
import React, { useEffect, useRef } from 'react';
import { theme } from '@src/theme';
import * as echarts from 'echarts';

interface BoardMetricsChartProps {
  dateRanges: string[];
  data: IReportInfo[] | undefined;
  metrics: string[];
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
  const trendInfo = calculateTrendInfo(velocity, dateRanges, ChartType.Velocity);
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

function extractCycleTimeData(dateRanges: string[], mappedData?: ReportResponse[]) {
  const data = mappedData?.map((item) => item.cycleTimeList);
  const storyPoints = data?.map((item) => item?.[0]?.valueList?.[0]?.value as number);
  const cardCount = data?.map((item) => item?.[0]?.valueList?.[1]?.value as number);
  const trendInfo = calculateTrendInfo(storyPoints, dateRanges, ChartType.CycleTime);
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

function extractCycleTimeAllocationData(dateRanges: string[], mappedData?: ReportResponse[]) {
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
  const trendInfo = calculateTrendInfo(developmentPercentageList, dateRanges, ChartType.CycleTimeAllocation);

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

  const trendInfo = calculateTrendInfo(totalReworkTimes, dateRanges, ChartType.Rework);
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
        tooltip: { valueFormatter },
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

export const BoardMetricsChart = ({ data, dateRanges, metrics }: BoardMetricsChartProps) => {
  const cycleTime = useRef<HTMLDivElement>(null);
  const averageCycleTime = useRef<HTMLDivElement>(null);
  const velocity = useRef<HTMLDivElement>(null);
  const rework = useRef<HTMLDivElement>(null);

  const mappedData: ReportResponse[] | undefined =
    data && data.map((item) => (item.reportData?.boardMetricsCompleted ? reportMapper(item.reportData) : emptyData));

  const cycleTimeAllocationData = extractCycleTimeAllocationData(dateRanges, mappedData);
  const cycleTimeData = extractCycleTimeData(dateRanges, mappedData);
  const velocityData = extractVelocityData(dateRanges, mappedData);
  const reworkData = extractReworkData(dateRanges, mappedData);

  const isVelocityFinished = mappedData?.flatMap((value) => value.velocityList)?.length == dateRanges.length * 2;
  const isCycleTimeFinished =
    mappedData?.flatMap((value) => value.cycleTimeList?.[0]?.valueList)?.length == dateRanges.length * 2;
  const reworkList = mappedData?.map((values) => values.rework).filter((value) => value);
  const isReworkFinished =
    reworkList?.length == dateRanges.length &&
    reworkList?.every((values) => values?.totalReworkTimes && values.totalReworkCards && values.reworkCardsRatio);

  useEffect(() => {
    if (velocity.current) {
      const velocityChart = echarts.init(velocity.current);
      velocityChart.showLoading(CHART_LOADING);
      if (isVelocityFinished) {
        velocityChart.hideLoading();
        const option = velocityData && stackedAreaOptionMapper(velocityData);
        velocityChart.setOption(option);
      }
      return () => {
        velocityChart.dispose();
      };
    }
  }, [velocity, velocityData, isVelocityFinished]);

  useEffect(() => {
    if (averageCycleTime.current) {
      const averageCycleTimeChart = echarts.init(averageCycleTime.current);
      averageCycleTimeChart.showLoading(CHART_LOADING);
      if (isCycleTimeFinished) {
        averageCycleTimeChart.hideLoading();
        const option = cycleTimeData && stackedAreaOptionMapper(cycleTimeData);
        averageCycleTimeChart.setOption(option);
      }
      return () => {
        averageCycleTimeChart.dispose();
      };
    }
  }, [averageCycleTime, cycleTimeData, isCycleTimeFinished]);

  useEffect(() => {
    if (cycleTime.current) {
      const cycleTimeChart = echarts.init(cycleTime.current);
      cycleTimeChart.showLoading(CHART_LOADING);
      if (isCycleTimeFinished) {
        cycleTimeChart.hideLoading();
        const option = cycleTimeAllocationData && stackedBarOptionMapper(cycleTimeAllocationData);
        cycleTimeChart.setOption(option);
      }
      return () => {
        cycleTimeChart.dispose();
      };
    }
  }, [cycleTime, cycleTimeAllocationData, isCycleTimeFinished]);

  useEffect(() => {
    if (rework.current) {
      const reworkChart = echarts.init(rework.current);
      reworkChart.showLoading(CHART_LOADING);
      if (isReworkFinished) {
        reworkChart.hideLoading();
        const option = reworkData && stackedAreaOptionMapper(reworkData);
        reworkChart.setOption(option);
      }
      return () => {
        reworkChart.dispose();
      };
    }
  }, [rework, reworkData, isReworkFinished]);

  return (
    <ChartContainer>
      {metrics.includes(RequiredData.Velocity) && (
        <ChartAndTitleWrapper trendInfo={velocityData.trendInfo} ref={velocity} isLoading={!isVelocityFinished} />
      )}
      {metrics.includes(RequiredData.CycleTime) && (
        <ChartAndTitleWrapper
          trendInfo={cycleTimeData.trendInfo}
          ref={averageCycleTime}
          isLoading={!isCycleTimeFinished}
        />
      )}
      {metrics.includes(RequiredData.CycleTime) && (
        <ChartAndTitleWrapper
          trendInfo={cycleTimeAllocationData.trendInfo}
          ref={cycleTime}
          isLoading={!isCycleTimeFinished}
        />
      )}
      {metrics.includes(RequiredData.ReworkTimes) && (
        <ChartAndTitleWrapper trendInfo={reworkData.trendInfo} ref={rework} isLoading={!isReworkFinished} />
      )}
    </ChartContainer>
  );
};
