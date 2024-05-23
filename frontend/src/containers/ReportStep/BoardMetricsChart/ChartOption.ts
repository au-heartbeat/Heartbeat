import { xAxisLabelDateFormatter } from '@src/utils/util';
import { theme } from '@src/theme';

export interface BarOptionProps {
  title: string;
  xAxis: string[];
  yAxis: YAxis;
  series: Series[] | undefined;
  color: string[];
}

export interface AreaOptionProps {
  title: string;
  xAxis: XAxis;
  yAxis: YAxis[];
  series: Series[] | undefined;
  color: string[];
}

export interface Series {
  name: string;
  type: string;
  data: number[];
  smooth?: boolean;
  areaStyle?: unknown;
  yAxisIndex?: number;
}

export interface XAxis {
  data: string[];
  axisLabel?: AxisLabel;
  boundaryGap?: boolean;
}

export interface AxisLabel {
  color: string;
  alignMaxLabel: string;
  alignMinLabel: string;
}

export interface YAxis {
  name: string;
  alignTick: boolean;
  axisLabel: string;
}

const commonConfig = {
  legend: {
    icon: 'circle',
    top: '86%',
    left: '10%',
    itemGap: 15,
  },
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    show: true,
    borderColor: 'transparent',
    left: '12%',
    right: '10%',
    top: '20%',
    bottom: '25%',
  },
  axisConfig: {
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        width: 1,
      },
    },
    axisLine: {
      lineStyle: {
        color: theme.main.boardChart.gridColor,
        width: 1,
        type: 'dashed',
      },
    },
  },
  seriesConfig: {
    symbol: 'circle',
    symbolSize: 7,
    lineStyle: {
      width: 3,
    },
    barWidth: '20%',
  },
};

export const stackedAreaOptionMapper = (props: AreaOptionProps) => {
  return {
    title: {
      text: props.title,
      left: '22',
    },
    legend: {
      data: props.series?.map((item) => item.name),
      ...commonConfig.legend,
    },
    tooltip: commonConfig.tooltip,
    grid: commonConfig.grid,
    xAxis: {
      data: props.xAxis.data,
      boundaryGap: props.xAxis.boundaryGap,
      axisLabel: props.xAxis.axisLabel,
      ...commonConfig.axisConfig,
    },
    yAxis: props.yAxis?.map((item, index) => {
      return {
        name: item.name,
        position: index === 0 ? 'left' : 'right',
        nameTextStyle: {
          align: index === 0 ? 'left' : 'right',
        },
        type: 'value',
        axisLabel: {
          show: true,
          formatter: `{value}${item.axisLabel}`,
        },
        splitLine: commonConfig.axisConfig.splitLine,
      };
    }),
    color: props.color,
    series: props.series?.map((item) => {
      return {
        name: item.name,
        data: item.data,
        type: item.type,
        yAxisIndex: item.yAxisIndex,
        smooth: item.smooth,
        areaStyle: item.areaStyle,
        ...commonConfig.seriesConfig,
      };
    }),
  };
};

export const stackedBarOptionMapper = (props: BarOptionProps) => {
  return {
    title: {
      text: props.title,
      left: '22',
    },
    legend: {
      data: props.series?.map((item) => item.name),
      ...commonConfig.legend,
    },
    tooltip: {
      valueFormatter: (value: number) => value + '%',
      ...commonConfig.tooltip,
    },
    grid: commonConfig.grid,
    xAxis: {
      data: props.xAxis,
      axisLabel: {
        color: 'black',
        formatter: xAxisLabelDateFormatter,
      },
      ...commonConfig.axisConfig,
    },
    yAxis: {
      name: props.yAxis.name,
      nameTextStyle: {
        align: 'left',
      },
      type: 'value',
      splitLine: commonConfig.axisConfig.splitLine,
      axisLabel: {
        show: true,
        formatter: `{value}${props.yAxis.axisLabel}`,
      },
    },
    color: props.color,
    series: props.series?.map((item) => {
      return {
        name: item.name,
        data: item.data,
        barWidth: '20%',
        type: item.type,
        stack: 'x',
      };
    }),
  };
};
