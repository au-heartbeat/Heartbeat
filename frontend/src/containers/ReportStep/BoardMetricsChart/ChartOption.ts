export interface BarOptionProps {
  title: string;
  legend: string;
  xAxis: string[];
  yAxis: yAxis;
  series: Series[] | undefined;
  color: string[];
}

export interface AreaOptionProps {
  title: string;
  legend: string;
  xAxis: string[];
  yAxis: yAxis[];
  series: Series[] | undefined;
  color: string[];
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

export const stackedAreaOptionMapper = (props: AreaOptionProps) => {
  return {
    title: {
      text: props.title,
    },
    legend: {
      data: props.series?.map((item) => item.name),
      bottom: 1,
      left: 10,
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      show: true,
      borderColor: 'transparent',
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
    },
    yAxis: props.yAxis?.map((item, index) => {
      return {
        name: item.name,
        position: index === 0 ? 'left' : 'right',
        nameTextStyle: {
          align: 'center',
        },
        type: 'value',
        axisLabel: {
          show: true,
          formatter: `{value}${item.axisLabel}`,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            width: 1,
          },
        },
      };
    }),
    color: props.color,
    series: props.series?.map((item) => {
      return {
        name: item.name,
        data: item.data,
        type: item.type,
        areaStyle: {
          opacity: 0.3,
        },
        smooth: true,
      };
    }),
  };
};
export const stackedBarOptionMapper = (props: BarOptionProps) => {
  return {
    title: {
      text: props.title,
    },
    legend: {
      data: props.series?.map((item) => item.name),
      bottom: 1,
      left: 10,
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      show: true,
      left: '7%',
      right: '4%',
    },
    xAxis: {
      data: props.xAxis,
    },
    yAxis: {
      name: props.yAxis.name,
      nameTextStyle: {
        align: 'left',
      },
      type: 'value',
      alignTick: false,
    },
    color: props.color,
    series: props.series?.map((item) => {
      return {
        name: item.name,
        data: item.data,
        barWidth: 30,
        type: item.type,
        stack: 'x',
      };
    }),
  };
};
