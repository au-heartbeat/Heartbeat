export interface IBoardMetricsResult {
  velocity: string;
  throughput: string;
  averageCycleTimeForSP: string;
  averageCycleTimeForCard: string;
  totalReworkTimes: string;
  totalReworkCards: string;
  reworkCardsRatio: string;
  reworkThroughput: string;
}

export interface IBoardMetricsDetailItem {
  name: string;
  value: string;
  subtitle?: string;
}

export const BOARD_METRICS_RESULT: IBoardMetricsResult = {
  velocity: '17',
  throughput: '9',
  averageCycleTimeForSP: '4.86',
  averageCycleTimeForCard: '9.18',
  totalReworkTimes: '11',
  totalReworkCards: '6',
  reworkCardsRatio: '0.6667',
  reworkThroughput: '9',
};

export const BOARD_METRICS_RESULT_MULTIPLE_RANGES: IBoardMetricsResult[] = [
  {
    velocity: '4',
    throughput: '2',
    averageCycleTimeForSP: '4.41',
    averageCycleTimeForCard: '8.83',
    totalReworkTimes: '2',
    totalReworkCards: '1',
    reworkCardsRatio: '0.5000',
    reworkThroughput: '2',
  },
  {
    velocity: '13',
    throughput: '7',
    averageCycleTimeForSP: '5.24',
    averageCycleTimeForCard: '9.73',
    totalReworkTimes: '11',
    totalReworkCards: '6',
    reworkCardsRatio: '0.8571',
    reworkThroughput: '7',
  },
  {
    velocity: '5',
    throughput: '2',
    averageCycleTimeForSP: '2.99',
    averageCycleTimeForCard: '7.47',
    totalReworkTimes: '3',
    totalReworkCards: '1',
    reworkCardsRatio: '0.5000',
    reworkThroughput: '2',
  },
];

export const BOARD_METRICS_VELOCITY_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
  [
    {
      name: 'Velocity(Story Point)',
      value: '4',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '2',
    },
  ],
  [
    {
      name: 'Velocity(Story Point)',
      value: '13',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '7',
    },
  ],
  [
    {
      name: 'Velocity(Story Point)',
      value: '5',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '2',
    },
  ],
];

export const BOARD_METRICS_CYCLETIME_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
  [
    {
      name: 'Average cycle time',
      value: '4.41(Days/SP)',
    },
    {
      name: 'Average cycle time',
      value: '8.83(Days/Card)',
    },
    {
      name: 'Total development time / Total cycle time',
      value: '34.11%',
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      value: '15.52%',
    },
    {
      name: 'Total block time / Total cycle time',
      value: '5.55%',
    },
    {
      name: 'Total review time / Total cycle time',
      value: '38.92%',
    },
    {
      name: 'Total testing time / Total cycle time',
      value: '5.89%',
    },
    {
      name: 'Average development time',
      value: '1.51(Days/SP)',
    },
    {
      name: 'Average development time',
      value: '3.01(Days/Card)',
    },
    {
      name: 'Average waiting for testing time',
      value: '0.69(Days/SP)',
    },
    {
      name: 'Average waiting for testing time',
      value: '1.37(Days/Card)',
    },
    {
      name: 'Average block time',
      value: '0.25(Days/SP)',
    },
    {
      name: 'Average block time',
      value: '0.49(Days/Card)',
    },
    {
      name: 'Average review time',
      value: '1.72(Days/SP)',
    },
    {
      name: 'Average block time',
      value: '3.44(Days/Card)',
    },
    {
      name: 'Average testing time',
      value: '0.26(Days/SP)',
    },
    {
      name: 'Average block time',
      value: '0.52(Days/Card)',
    },
  ],
];

export const BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
  [
    {
      name: 'Issue Type',
      subtitle: 'Task',
      value: '	100.00%',
    },
    {
      name: 'Issue Type',
      subtitle: 'Task',
      value: '	100.00%',
    },
    {
      name: 'Parent',
      subtitle: 'ADM-322',
      value: '	50.00%',
    },
    {
      name: 'Parent',
      subtitle: 'ADM-319',
      value: '	50.00%',
    },
    {
      name: 'Story testing-2',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Story testing-1',
      subtitle: '1.0',
      value: '	100.00%',
    },
    {
      name: 'Sprint',
      subtitle: 'Sprint 27',
      value: '	100.00%',
    },
    {
      name: 'Sprint',
      subtitle: 'Sprint 28',
      value: '	100.00%',
    },
    {
      name: 'Project',
      subtitle: 'Auto Dora Metrics',
      value: '	100.00%',
    },
    {
      name: 'Flagged',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Fix versions',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Priority',
      subtitle: 'Medium',
      value: '	100.00%',
    },
    {
      name: 'Partner',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Labels',
      subtitle: 'Stream1',
      value: '	50.00%',
    },
    {
      name: 'Labels',
      subtitle: 'Stream2',
      value: '	50.00%',
    },
    {
      name: 'Time tracking',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Story point estimate',
      subtitle: '1.0',
      value: '	50.00%',
    },
    {
      name: 'Story point estimate',
      subtitle: '3.0',
      value: '	50.00%',
    },
    {
      name: 'QA',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Feature/Operation',
      subtitle: 'None',
      value: '	100.00%',
    },
    {
      name: 'Assignee',
      subtitle: 'Weiran Sun',
      value: '	50.00%',
    },
    {
      name: 'Assignee',
      subtitle: 'Yunsong Yang',
      value: '	50.00%',
    },
  ],
];

export const BOARD_METRICS_REWORK_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
  [
    {
      name: 'Total rework',
      value: '2 (times)',
    },
    {
      name: 'From block to in dev',
      value: '2 (times)',
    },
    {
      name: 'Total rework cards',
      value: '1 (cards)',
    },
    {
      name: 'Rework cards ratio',
      value: '50.00% (rework cards/throughput)',
    },
  ],
];

export const FLAG_AS_BLOCK_PROJECT_BOARD_METRICS_RESULT: IBoardMetricsResult = {
  velocity: '7.5',
  throughput: '5',
  averageCycleTimeForSP: '0.55',
  averageCycleTimeForCard: '0.83',
  totalReworkTimes: '3',
  totalReworkCards: '3',
  reworkCardsRatio: '0.6000',
  reworkThroughput: '5',
};

export const DORA_METRICS_RESULT = {
  PrLeadTime: '6.12',
  PipelineLeadTime: '0.50',
  TotalLeadTime: '6.62',
  DeploymentFrequency: '6.60',
  FailureRate: '17.50% (7/40)',
  DevMeanTimeToRecovery: '1.90',
};
