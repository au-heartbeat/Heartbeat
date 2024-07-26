import { percentageFormatter, xAxisLabelDateFormatter } from '@src/utils/util';
import { theme } from '@src/theme';

enum EchartsLegendType {
  SCROLL = 'scroll',
  PLAIN = 'plain',
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

export interface AreaOptionProps {
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
  tooltip?: object;
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

export interface BarOptionProps {
  legend?: string;
  xAxis: string[];
  yAxis: YAxis;
  series: Series[] | undefined;
  color: string[];
}

interface PieSeries {
  name: string;
  value: string | number;
}

export interface PieOptionProps {
  legend?: string;
  series?: PieSeries[];
  color: string[];
}

export interface LineOptionProps {
  legend: string;
  xAxis: string[];
  yAxis: YAxis;
  series: Series;
  color: string;
  valueType?: string;
}

export function getEchartsLegendType(series: Series[] | undefined): EchartsLegendType {
  if (series && series.length > 10) {
    return EchartsLegendType.SCROLL;
  }
  return EchartsLegendType.PLAIN;
}

export const oneLineOptionMapper = (props: LineOptionProps) => {
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: percentageFormatter(!!props.valueType),
    },
    xAxis: {
      data: props.xAxis,
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          width: 1,
        },
      },
      axisLabel: {
        show: true,
        fontSize: 12,
        color: 'black',
        alignMaxLabel: 'right',
        alignMinLabel: 'left',
        formatter: xAxisLabelDateFormatter,
      },
      axisLine: {
        lineStyle: {
          color: theme.main.doraChart.gridColor,
          width: 1,
          type: 'dashed',
        },
      },
    },
    color: [props.color],
    yAxis: {
      name: props.yAxis.name,
      type: 'value',
      nameTextStyle: {
        align: 'left',
      },
      paddingLeft: 10,
      axisLabel: {
        show: true,
        interval: 'auto',
        formatter: `{value}${props.yAxis.axisLabel}`,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          width: 1,
        },
      },
    },
    grid: {
      show: true,
      borderColor: 'transparent',
      left: '12%',
      right: '10%',
      top: '20%',
      bottom: '25%',
    },
    series: {
      name: props.series.name,
      data: props.series.data,
      type: props.series.type,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: {
        width: 3,
      },
      areaStyle: {
        opacity: 0.3,
      },
      tooltip: props.series.tooltip,
    },
  };
};

export const stackedAreaOptionMapper = (
  props: AreaOptionProps,
  showPercentage: boolean = false,
  animation: boolean = true,
) => {
  const series = props.series;
  return {
    legend: {
      data: series?.length === 1 ? [] : series?.map((item) => item.name),
      ...commonConfig.legend,
      type: getEchartsLegendType(series),
    },
    tooltip: {
      valueFormatter: percentageFormatter(showPercentage),
      ...commonConfig.tooltip,
    },
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
        alignTicks: true,
        axisLabel: {
          show: true,
          formatter: `{value}${item.axisLabel}`,
        },
        splitLine: commonConfig.axisConfig.splitLine,
      };
    }),
    color: props.color,
    animation: animation,
    series: series?.map((item) => {
      return {
        name: item.name,
        data: item.data,
        type: item.type,
        yAxisIndex: item.yAxisIndex,
        smooth: item.smooth,
        areaStyle: item.areaStyle,
        tooltip: item.tooltip,
      };
    }),
  };
};

export const stackedBarOptionMapper = (
  props: BarOptionProps,
  showPercentage: boolean = true,
  animation: boolean = true,
) => {
  const series = props.series;
  return {
    legend: {
      data: series?.length === 1 ? [] : series?.map((item) => item.name),
      ...commonConfig.legend,
      type: getEchartsLegendType(series),
    },
    tooltip: {
      valueFormatter: percentageFormatter(showPercentage),
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
    animation: animation,
    series: series?.map((item) => {
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

export const pieOptionMapper = (props: PieOptionProps, showPercentage: boolean = true) => {
  const series = props.series;
  return {
    legend: {
      data: [],
      ...commonConfig.legend,
      top: 'center',
      orient: 'vertical',
    },
    tooltip: {
      valueFormatter: percentageFormatter(showPercentage),
      trigger: 'item',
    },
    color: props.color,
    animation: false,
    series: [
      {
        type: 'pie',
        data: series,
        center: ['50%', '50%'],
        label: {
          formatter: '{b} ({c}%)',
        },
      },
    ],
  };
};
