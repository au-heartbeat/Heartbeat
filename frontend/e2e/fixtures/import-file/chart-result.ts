export type DoraChartType = {
  [key: string]: {
    [key: string]: {
      exist: boolean;
      type: string;
      color: string;
      value: string;
    };
  };
};

export const BOARD_CHART_VALUE = {
  Velocity: {
    type: 'trend up',
    color: '#02C4A8',
    value: '400.00%',
  },
  'Average Cycle Time': {
    type: 'trend down',
    color: '#02C4A8',
    value: '19.19%',
  },
  'Cycle Time Allocation': {
    type: 'trend down',
    color: '#E82107',
    value: '5.49%',
  },
  Rework: {
    type: 'trend up',
    color: '#02C4A8',
    value: '0.00%',
  },
};

export const DORA_CHART_VALUE: DoraChartType = {
  All: {
    'Lead Time For Changes': {
      type: 'trend down',
      color: '#02C4A8',
      value: '87.99%',
      exist: true,
    },
    'Deployment Frequency': {
      type: 'trend down',
      color: '#E82107',
      value: '57.50%',
      exist: true,
    },
    'Pipeline Change Failure Rate': {
      type: 'trend down',
      color: '#02C4A8',
      value: '59.99%',
      exist: false,
    },
    'Pipeline Mean Time To Recovery': {
      type: 'trend down',
      color: '#02C4A8',
      value: '22.19%',
      exist: false,
    },
  },
  'Heartbeat/ Deploy prod': {
    'Lead Time For Changes': {
      type: 'trend down',
      color: '#02C4A8',
      value: '87.99%',
      exist: true,
    },
    'Deployment Frequency': {
      type: 'trend down',
      color: '#E82107',
      exist: true,
      value: '57.50%',
    },
    'Pipeline Change Failure Rate': {
      type: 'trend down',
      color: '#02C4A8',
      exist: false,
      value: '59.99%',
    },
    'Pipeline Mean Time To Recovery': {
      type: 'trend down',
      color: '#02C4A8',
      exist: false,
      value: '22.19%',
    },
  },
};

export const DORA_CHART_PIPELINES = ['All', 'Heartbeat/ Deploy prod'];

export const DORA_CHART_VALUE_WITH_PIPELINE_AND_SOURCE_CONTROL: DoraChartType = {
  All: {
    'Lead Time For Changes': {
      type: 'trend down',
      color: '#02C4A8',
      value: '91.36%',
      exist: true,
    },
    'Deployment Frequency': {
      type: 'trend down',
      color: '#E82107',
      value: '70.00%',
      exist: true,
    },
    'Pipeline Change Failure Rate': {
      type: 'trend up',
      color: '#E82107',
      value: '57.21%',
      exist: true,
    },
    'Pipeline Mean Time To Recovery': {
      type: 'trend up',
      color: '#E82107',
      value: '2230.00%',
      exist: true,
    },
  },
  'Heartbeat/ Deploy prod': {
    'Lead Time For Changes': {
      type: 'trend down',
      color: '#02C4A8',
      value: '62.27%',
      exist: true,
    },
    'Deployment Frequency': {
      type: 'trend down',
      color: '#E82107',
      value: '70.00%',
      exist: true,
    },
    'Pipeline Change Failure Rate': {
      type: 'trend up',
      color: '#E82107',
      value: '57.21%',
      exist: true,
    },
    'Pipeline Mean Time To Recovery': {
      type: 'trend up',
      color: '#E82107',
      value: '2230.00%',
      exist: true,
    },
  },
  'MYOB-Technology/AD-Framework': {
    'Lead Time For Changes': {
      type: 'trend down',
      color: '#02C4A8',
      value: '62.27%',
      exist: false,
    },
    'Deployment Frequency': {
      type: 'trend down',
      color: '#E82107',
      value: '70.00%',
      exist: false,
    },
    'Pipeline Change Failure Rate': {
      type: 'trend up',
      color: '#E82107',
      value: '57.21%',
      exist: false,
    },
    'Pipeline Mean Time To Recovery': {
      type: 'trend up',
      color: '#E82107',
      value: '2230.00%',
      exist: false,
    },
  },
};

export const DORA_CHART_PIPELINES_WITH_PIPELINE_AND_SOURCE_CONTROL = [
  'All',
  'Heartbeat/ Deploy prod',
  'MYOB-Technology/AD-Framework',
];
