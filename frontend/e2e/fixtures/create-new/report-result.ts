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

export const BOARD_METRICS_CYCLETIME_MULTIPLE_RANGES: IBoardCycletimeDetailItem[][] = [
  [
    {
      name: 'Average cycle time',
      lines: ['4.41(Days/SP)', '8.83(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['34.11%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['15.52%'],
    },
    {
      name: 'Total block time / Total cycle time',
      lines: ['5.55%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['38.92%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['5.89%'],
    },
    {
      name: 'Average development time',
      lines: ['1.51(Days/SP)', '3.01(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.69(Days/SP)', '1.37(Days/Card)'],
    },
    {
      name: 'Average block time',
      lines: ['0.25(Days/SP)', '0.49(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['1.72(Days/SP)', '3.44(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.26(Days/SP)', '0.52(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['5.24(Days/SP)', '9.73(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['38.48%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['10.5%'],
    },
    {
      name: 'Total block time / Total cycle time',
      lines: ['24.23%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['16.9%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['9.9%'],
    },
    {
      name: 'Average development time',
      lines: ['2.02(Days/SP)', '3.74(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.55(Days/SP)', '1.02(Days/Card)'],
    },
    {
      name: 'Average block time',
      lines: ['1.27(Days/SP)', '2.36(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.89(Days/SP)', '1.64(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.52(Days/SP)', '0.96(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['2.99(Days/SP)', '7.47(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['37.75%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['18.67%'],
    },
    {
      name: 'Total block time / Total cycle time',
      lines: ['14.32%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['23.69%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['5.56%'],
    },
    {
      name: 'Average development time',
      lines: ['1.13(Days/SP)', '2.82(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.56(Days/SP)', '1.40(Days/Card)'],
    },
    {
      name: 'Average block time',
      lines: ['0.43(Days/SP)', '1.07(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.71(Days/SP)', '1.77(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.17(Days/SP)', '0.42(Days/Card)'],
    },
  ],
];

export const BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES: IBoardClassificationDetailItem[][] = [
  [
    {
      name: 'Issue Type',
      lines: [['Task', '100.00%']],
    },
    {
      name: 'Parent',
      lines: [
        ['ADM-322', '50.00%'],
        ['ADM-319', '50.00%'],
      ],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['1.0', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [
        ['Sprint 27', '100.00%'],
        ['Sprint 28', '100.00%'],
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
      lines: [['None', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [
        ['Stream1', '50.00%'],
        ['Stream2', '50.00%'],
      ],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [
        ['1.0', '50.00%'],
        ['3.0', '50.00%'],
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
        ['Weiran Sun', '50.00%'],
        ['Yunsong Yang', '50.00%'],
      ],
    },
  ],
  [
    {
      name: 'Issue Type',
      lines: [
        ['Spike', '14.29%'],
        ['Task', '85.71%'],
      ],
    },
    {
      name: 'Parent',
      lines: [
        ['ADM-322', '71.43%'],
        ['ADM-279', '28.57%'],
      ],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [
        ['1.0', '85.71%'],
        ['None', '14.29%'],
      ],
    },
    {
      name: 'Sprint',
      lines: [
        ['Sprint 26', '14.29%'],
        ['Sprint 27', '100.00%'],
        ['Sprint 28', '100.00%'],
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
      lines: [['None', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [
        ['Stream1', '42.86%'],
        ['Stream2', '57.14%'],
      ],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [
        ['1.0', '42.86%'],
        ['2.0', '28.57%'],
        ['3.0', '28.57%'],
      ],
    },
    {
      name: 'QA',
      lines: [
        ['Weiran Sun', '14.29%'],
        ['None', '85.71%'],
      ],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [
        ['heartbeat user', '57.14%'],
        ['Junbo Dai', '14.29%'],
        ['Weiran Sun', '14.29%'],
        ['Xuebing Li', '14.29%'],
      ],
    },
  ],
  [
    {
      name: 'Issue Type',
      lines: [['Task', '100.00%']],
    },
    {
      name: 'Parent',
      lines: [['ADM-322', '100.00%']],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['1.0', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [
        ['Sprint 27', '100.00%'],
        ['Sprint 28', '50.00%'],
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
      lines: [['None', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [['Stream1', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [
        ['2.0', '50.00%'],
        ['3.0', '50.00%'],
      ],
    },
    {
      name: 'QA',
      lines: [
        ['Weiran Sun', '50.00%'],
        ['None', '50.00%'],
      ],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [
        ['Junbo Dai', '50.00%'],
        ['Xinyi Wang', '50.00%'],
      ],
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
  [
    {
      name: 'Total rework',
      value: '11 (times)',
    },
    {
      name: 'From block to in dev',
      value: '11 (times)',
    },
    {
      name: 'Total rework cards',
      value: '6 (cards)',
    },
    {
      name: 'Rework cards ratio',
      value: '85.71% (rework cards/throughput)',
    },
  ],
  [
    {
      name: 'Total rework',
      value: '3 (times)',
    },
    {
      name: 'From block to in dev',
      value: '3 (times)',
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

export const BAORD_CSV_COMPARED_LINES: ICsvComparedLines = {
  'board-20240115-20240116': 2,
  'board-20240117-20240118': 7,
  'board-20240119-20240119': 2,
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
  PrLeadTime: '6.12',
  PipelineLeadTime: '0.50',
  TotalLeadTime: '6.62',
  DeploymentFrequency: '6.60',
  FailureRate: '17.50% (7/40)',
  DevMeanTimeToRecovery: '1.90',
};

export const DORA_METRICS_RESULT_MULTIPLE_RANGES: IDoraMetricsResultItem[] = [
  {
    prLeadTime: '7.64',
    pipelineLeadTime: '0.40',
    totalLeadTime: '8.04',
    deploymentFrequency: '1.50',
    failureRate: '40.00% (2/5)',
    devMeanTimeToRecovery: '0.30',
  },
  {
    prLeadTime: '2.12',
    pipelineLeadTime: '0.42',
    totalLeadTime: '2.54',
    deploymentFrequency: '4.67',
    failureRate: '6.67% (1/15)',
    devMeanTimeToRecovery: '2.91',
  },
  {
    prLeadTime: '9.95',
    pipelineLeadTime: '0.56',
    totalLeadTime: '10.51',
    deploymentFrequency: '7.50',
    failureRate: '16.67% (3/18)',
    devMeanTimeToRecovery: '3.74',
  },
];
