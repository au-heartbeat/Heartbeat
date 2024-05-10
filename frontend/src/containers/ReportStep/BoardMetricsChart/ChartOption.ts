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
}

export interface XAxis {
  data: string[];
  boundaryGap?: boolean;
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
    left: '9%',
    itemGap: 15,
  },
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    show: true,
    borderColor: 'transparent',
    left: '10%',
    right: '4%',
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
        color: '#d9d9d9',
        width: 1,
        type: 'dashed',
      },
    },
    axisLabel: {
      color: 'black',
    },
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
      ...commonConfig.axisConfig,
    },
    yAxis: props.yAxis?.map((item, index) => {
      return {
        name: item.name,
        position: index === 0 ? 'left' : 'right',
        nameTextStyle: {
          align: 'right',
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
      left: '22',
    },
    legend: {
      data: props.series?.map((item) => item.name),
      ...commonConfig.legend,
    },
    tooltip: commonConfig.tooltip,
    grid: commonConfig.grid,
    xAxis: {
      data: props.xAxis,
      ...commonConfig.axisConfig,
    },
    yAxis: {
      name: props.yAxis.name,
      nameTextStyle: {
        align: 'left',
      },
      type: 'value',
      splitLine: commonConfig.axisConfig.splitLine,
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
