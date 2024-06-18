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
export interface IDoraMetricsResultItem {
  prLeadTime: string;
  pipelineLeadTime: string;
  totalLeadTime: string;
  deploymentFrequency: string;
  failureRate: string;
  devMeanTimeToRecovery: string;
}

export interface IBoardMetricsDetailItem {
  name: string;
  value: string;
}

export interface IBoardCycletimeDetailItem {
  name: string;
  lines: string[];
}

export interface IBoardClassificationDetailItem {
  name: string;
  lines: [string, string][];
}

export interface ICsvComparedLines extends Record<string, number> {}

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
    velocity: '1',
    throughput: '1',
    averageCycleTimeForSP: '0.98',
    averageCycleTimeForCard: '0.98',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '1',
  },
  {
    velocity: '1',
    throughput: '1',
    averageCycleTimeForSP: '3.03',
    averageCycleTimeForCard: '3.03',
    totalReworkTimes: '1',
    totalReworkCards: '1',
    reworkCardsRatio: '1.0000',
    reworkThroughput: '1',
  },
  {
    velocity: '5.5',
    throughput: '3',
    averageCycleTimeForSP: '5.39',
    averageCycleTimeForCard: '9.88',
    totalReworkTimes: '1',
    totalReworkCards: '1',
    reworkCardsRatio: '0.3333',
    reworkThroughput: '3',
  },
];

export const BOARD_METRICS_VELOCITY_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
  [
    {
      name: 'Velocity(Story Point)',
      value: '1',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '1',
    },
  ],
  [
    {
      name: 'Velocity(Story Point)',
      value: '1',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '1',
    },
  ],
  [
    {
      name: 'Velocity(Story Point)',
      value: '5.5',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '3',
    },
  ],
];

export const BOARD_METRICS_CYCLETIME_MULTIPLE_RANGES: IBoardCycletimeDetailItem[][] = [
  [
    {
      name: 'Average cycle time',
      lines: ['0.98(Days/SP)', '0.98(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['14.29%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['85.71%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Average development time',
      lines: ['0.14(Days/SP)', '0.14(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.84(Days/SP)', '0.84(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['3.03(Days/SP)', '3.03(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['66.01%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['4.62%'],
    },
    {
      name: 'Total block time / Total cycle time',
      lines: ['4.95%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['24.42%'],
    },
    {
      name: 'Average development time',
      lines: ['2.00(Days/SP)', '2.00(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.14(Days/SP)', '0.14(Days/Card)'],
    },
    {
      name: 'Average block time',
      lines: ['0.15(Days/SP)', '0.15(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.74(Days/SP)', '0.74(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['5.39(Days/SP)', '9.88(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['74.29%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['3.34%'],
    },
    {
      name: 'Total block time / Total cycle time',
      lines: ['6.71%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['12.35%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['3.31%'],
    },
    {
      name: 'Average development time',
      lines: ['4.00(Days/SP)', '7.34(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.18(Days/SP)', '0.33(Days/Card)'],
    },
    {
      name: 'Average block time',
      lines: ['0.36(Days/SP)', '0.66(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.67(Days/SP)', '1.22(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.18(Days/SP)', '0.33(Days/Card)'],
    },
  ],
];

export const BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES: IBoardClassificationDetailItem[][] = [
  [
    {
      name: 'Issue Type',
      lines: [['Bug', '100.00%']],
    },
    {
      name: 'Parent',
      lines: [['ADM-319', '100.00%']],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Design',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Vulnerability',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [['Sprint37', '100.00%']],
    },
    {
      name: 'Project',
      lines: [['Auto Dora Metrics', '100.00%']],
    },
    {
      name: 'Flagged',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Fix versions',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Priority',
      lines: [['Medium', '100.00%']],
    },
    {
      name: 'Partner',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [['1.0', '100.00%']],
    },
    {
      name: 'QA',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [['YinYuan Zhou', '100.00%']],
    },
  ],
  [
    {
      name: 'Issue Type',
      lines: [['Bug', '100.00%']],
    },
    {
      name: 'Parent',
      lines: [['ADM-868', '100.00%']],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Design',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Vulnerability',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [['Sprint37', '100.00%']],
    },
    {
      name: 'Project',
      lines: [['Auto Dora Metrics', '100.00%']],
    },
    {
      name: 'Flagged',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Fix versions',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Priority',
      lines: [['High', '100.00%']],
    },
    {
      name: 'Partner',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [['1.1.7', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [['1.0', '100.00%']],
    },
    {
      name: 'QA',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [['Man Tang', '100.00%']],
    },
  ],
  [
    {
      name: 'Issue Type',
      lines: [
        ['Task', '66.67%'],
        ['Story', '33.33%'],
      ],
    },
    {
      name: 'Parent',
      lines: [['ADM-868', '100.00%']],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [
        ['1.0', '66.67%'],
        ['None', '33.33%'],
      ],
    },
    {
      name: 'Design',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Vulnerability',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [
        ['Sprint37', '100.00%'],
        ['Sprint 35', '33.33%'],
        ['Sprint 36', '66.67%'],
        ['Sprint34', '33.33%'],
      ],
    },
    {
      name: 'Project',
      lines: [['Auto Dora Metrics', '100.00%']],
    },
    {
      name: 'Flagged',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Fix versions',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Priority',
      lines: [['Medium', '100.00%']],
    },
    {
      name: 'Partner',
      lines: [
        ['YinYuan Zhou', '33.33%'],
        ['None', '66.67%'],
      ],
    },
    {
      name: 'Labels',
      lines: [['1.1.7', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [
        ['2.0', '33.33%'],
        ['3.0', '33.33%'],
        ['0.5', '33.33%'],
      ],
    },
    {
      name: 'QA',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [
        ['Chao Wang', '33.33%'],
        ['YinYuan Zhou', '33.33%'],
        ['Qiuhong Lei', '33.33%'],
      ],
    },
  ],
];

export const BOARD_METRICS_REWORK_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
  [
    {
      name: 'Total rework',
      value: '0 (times)',
    },
    {
      name: 'From block to in dev',
      value: '0 (times)',
    },
    {
      name: 'Total rework cards',
      value: '0 (cards)',
    },
    {
      name: 'Rework cards ratio',
      value: '0.00% (rework cards/throughput)',
    },
  ],
  [
    {
      name: 'Total rework',
      value: '1 (times)',
    },
    {
      name: 'From block to in dev',
      value: '1 (times)',
    },
    {
      name: 'Total rework cards',
      value: '1 (cards)',
    },
    {
      name: 'Rework cards ratio',
      value: '100.00% (rework cards/throughput)',
    },
  ],
  [
    {
      name: 'Total rework',
      value: '1 (times)',
    },
    {
      name: 'From block to in dev',
      value: '1 (times)',
    },
    {
      name: 'Total rework cards',
      value: '1 (cards)',
    },
    {
      name: 'Rework cards ratio',
      value: '33.33% (rework cards/throughput)',
    },
  ],
];

export const BAORD_CSV_COMPARED_LINES: ICsvComparedLines = {
  'board-20240603-20240604': 2,
  'board-20240605-20240606': 7,
  'board-20240607-20240607': 2,
};

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
  PrLeadTime: '3.21',
  PipelineLeadTime: '0.50',
  TotalLeadTime: '3.71',
  DeploymentFrequency: '6.60',
  FailureRate: '17.50% (7/40)',
  DevMeanTimeToRecovery: '1.90',
};

export const DORA_METRICS_RESULT_MULTIPLE_RANGES: IDoraMetricsResultItem[] = [
  {
    prLeadTime: '0.00',
    pipelineLeadTime: '0.00',
    totalLeadTime: '0.00',
    deploymentFrequency: '0.00',
    failureRate: '0.00%(0/0)',
    devMeanTimeToRecovery: '0.00',
  },
  {
    prLeadTime: '1.86',
    pipelineLeadTime: '0.36',
    totalLeadTime: '2.22',
    deploymentFrequency: '0.50',
    failureRate: '0.00%(0/1)',
    devMeanTimeToRecovery: '0.00',
  },
  {
    prLeadTime: '10.78',
    pipelineLeadTime: '0.59',
    totalLeadTime: '11.38',
    deploymentFrequency: '2.00',
    failureRate: '0.00%(0/4)',
    devMeanTimeToRecovery: '0.00',
  },
];

export const BOARD_METRICS_WITH_HOLIDAY_RESULT = {
  Velocity: '22',
  Throughput: '13',
  AverageCycleTime4SP: '3.57',
  AverageCycleTime4Card: '6.03',
  totalReworkTimes: '9',
  totalReworkCards: '6',
  reworkCardsRatio: '0.4615',
  throughput: '13',
};

export const DORA_METRICS_WITH_HOLIDAY_RESULT = {
  PrLeadTime: '13.57',
  PipelineLeadTime: '0.44',
  TotalLeadTime: '14.01',
  DeploymentFrequency: '2.10',
  FailureRate: '10.20% (5/49)',
  DevMeanTimeToRecovery: '6.88',
};
