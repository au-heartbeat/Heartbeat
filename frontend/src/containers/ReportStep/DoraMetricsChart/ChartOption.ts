import { xAxisLabelDateFormatter } from '@src/utils/util';

export interface BarOptionProps {
  title: string;
  legend: string;
  xAxis: string[];
  yAxis: yAxis;
  series: Series[] | undefined;
  color: string[];
}

export interface LineOptionProps {
  title: string;
  legend: string;
  xAxis: string[];
  yAxis: yAxis;
  series: Series;
  color: string;
}
export interface Series {
  name: string;
  type: string;
  data: number[];
}
export interface yAxis {
  name: string;
  alignTick: boolean;
  axisLabel: string;
}

export const oneLineOptionMapper = (props: LineOptionProps) => {
  return {
    title: {
      text: props.title,
      left: '22',
      textStyle: {
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
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
          color: '#d9d9d9',
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
    },
  };
};
export const stackedBarOptionMapper = (props: BarOptionProps) => {
  return {
    title: {
      text: props.title,
      left: '22',
      textStyle: {
        fontSize: 16,
      },
    },
    legend: {
      icon: 'circle',
      data: props.series?.map((item) => item.name),
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
    xAxis: {
      data: props.xAxis,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          width: 1,
        },
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
          width: 1,
          type: 'dashed',
        },
      },
      axisLabel: {
        color: 'black',
        formatter: xAxisLabelDateFormatter,
      },
    },
    yAxis: {
      name: props.yAxis.name,
      nameTextStyle: {
        align: 'left',
      },
      type: 'value',
      alignTick: false,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          width: 1,
        },
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
