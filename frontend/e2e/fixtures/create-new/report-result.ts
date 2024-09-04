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
  deploymentTimes: string;
  deploymentFrequency: string;
  failureRate: string;
  pipelineMeanTimeToRecovery: string;
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
  lines: [string, string, string][];
}

export interface ICsvComparedLines extends Record<string, number> {}

export const BOARD_METRICS_RESULT: IBoardMetricsResult = {
  velocity: '14',
  throughput: '6',
  averageCycleTimeForSP: '1.13',
  averageCycleTimeForCard: '2.64',
  totalReworkTimes: '0',
  totalReworkCards: '0',
  reworkCardsRatio: '0.0000',
  reworkThroughput: '6',
};

export const BOARD_METRICS_RESULT_MULTIPLE_RANGES: IBoardMetricsResult[] = [
  {
    velocity: '5',
    throughput: '2',
    averageCycleTimeForSP: '1.60',
    averageCycleTimeForCard: '3.99',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '2',
  },
  {
    velocity: '1',
    throughput: '1',
    averageCycleTimeForSP: '1.98',
    averageCycleTimeForCard: '1.98',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '1',
  },
  {
    velocity: '8',
    throughput: '3',
    averageCycleTimeForSP: '0.73',
    averageCycleTimeForCard: '1.96',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '3',
  },
];

export const BOARD_METRICS_WITH_DESIGN_AND_WAITING_FOR_DEPLOYMENT_RESULT_MULTIPLE_RANGES: IBoardMetricsResult[] = [
  {
    velocity: '5',
    throughput: '2',
    averageCycleTimeForSP: '4.97',
    averageCycleTimeForCard: '12.42',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '2',
  },
  {
    velocity: '1',
    throughput: '1',
    averageCycleTimeForSP: '12.52',
    averageCycleTimeForCard: '12.52',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '1',
  },
  {
    velocity: '8',
    throughput: '3',
    averageCycleTimeForSP: '13.17',
    averageCycleTimeForCard: '35.13',
    totalReworkTimes: '0',
    totalReworkCards: '0',
    reworkCardsRatio: '0.0000',
    reworkThroughput: '3',
  },
];

export const BOARD_METRICS_VELOCITY_MULTIPLE_RANGES: IBoardMetricsDetailItem[][] = [
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
      value: '8',
    },
    {
      name: 'Throughput(Cards Count)',
      value: '3',
    },
  ],
];

export const BOARD_METRICS_CYCLE_TIME_MULTIPLE_RANGES: IBoardCycletimeDetailItem[][] = [
  [
    {
      name: 'Average cycle time',
      lines: ['1.6(Days/SP)', '3.99(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['62.53%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['0.38%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['37.09%'],
    },
    {
      name: 'Average development time',
      lines: ['1.00(Days/SP)', '2.50(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.01(Days/SP)', '0.02(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.59(Days/SP)', '1.48(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['1.98(Days/SP)', '1.98(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['66.16%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['32.83%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['1.01%'],
    },
    {
      name: 'Average development time',
      lines: ['1.31(Days/SP)', '1.31(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.65(Days/SP)', '0.65(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.02(Days/SP)', '0.02(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['0.73(Days/SP)', '1.96(Days/Card)'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['54.17%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['1.02%'],
    },
    {
      name: 'Total waiting for testing time / Total cycle time',
      lines: ['1.7%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['43.1%'],
    },
    {
      name: 'Average development time',
      lines: ['0.40(Days/SP)', '1.06(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.01(Days/SP)', '0.02(Days/Card)'],
    },
    {
      name: 'Average waiting for testing time',
      lines: ['0.01(Days/SP)', '0.03(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.32(Days/SP)', '0.84(Days/Card)'],
    },
  ],
];

export const BOARD_METRICS_WITH_DESIGN_AND_WAITING_FOR_DEPLOYMENT_CYCLE_TIME: IBoardCycletimeDetailItem[][] = [
  [
    {
      name: 'Average cycle time',
      lines: ['4.97(Days/SP)', '12.42(Days/Card)'],
    },
    {
      name: 'Total design time / Total cycle time',
      lines: ['67.87%'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['20.09%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['11.92%'],
    },
    {
      name: 'Total waiting for deployment time / Total cycle time',
      lines: ['0.12%'],
    },
    {
      name: 'Average design time',
      lines: ['3.37(Days/SP)', '8.43(Days/Card)'],
    },
    {
      name: 'Average development time',
      lines: ['1.00(Days/SP)', '2.50(Days/Card)'],
    },

    {
      name: 'Average review time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.59(Days/SP)', '1.48(Days/Card)'],
    },
    {
      name: 'Average waiting for deployment time',
      lines: ['0.01(Days/SP)', '0.02(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['12.52(Days/SP)', '12.52(Days/Card)'],
    },
    {
      name: 'Total design time / Total cycle time',
      lines: ['84.19%'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['10.46%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['0.16%'],
    },
    {
      name: 'Total waiting for deployment time / Total cycle time',
      lines: ['5.19%'],
    },
    {
      name: 'Average design time',
      lines: ['10.54(Days/SP)', '10.54(Days/Card)'],
    },
    {
      name: 'Average development time',
      lines: ['1.31(Days/SP)', '1.31(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.00(Days/SP)', '0.00(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.02(Days/SP)', '0.02(Days/Card)'],
    },
    {
      name: 'Average waiting for deployment time',
      lines: ['0.65(Days/SP)', '0.65(Days/Card)'],
    },
  ],
  [
    {
      name: 'Average cycle time',
      lines: ['13.17(Days/SP)', '35.13(Days/Card)'],
    },
    {
      name: 'Total design time / Total cycle time',
      lines: ['94.43%'],
    },
    {
      name: 'Total development time / Total cycle time',
      lines: ['3.02%'],
    },
    {
      name: 'Total review time / Total cycle time',
      lines: ['0.06%'],
    },
    {
      name: 'Total testing time / Total cycle time',
      lines: ['2.4%'],
    },
    {
      name: 'Total waiting for deployment time / Total cycle time',
      lines: ['0.09%'],
    },
    {
      name: 'Average design time',
      lines: ['12.44(Days/SP)', '33.17(Days/Card)'],
    },
    {
      name: 'Average development time',
      lines: ['0.40(Days/SP)', '1.06(Days/Card)'],
    },
    {
      name: 'Average review time',
      lines: ['0.01(Days/SP)', '0.02(Days/Card)'],
    },
    {
      name: 'Average testing time',
      lines: ['0.32(Days/SP)', '0.84(Days/Card)'],
    },
    {
      name: 'Average waiting for deployment time',
      lines: ['0.01(Days/SP)', '0.03(Days/Card)'],
    },
  ],
];

export const BOARD_METRICS_CLASSIFICATION_MULTIPLE_RANGES: IBoardClassificationDetailItem[][] = [
  [
    {
      name: 'Issue Type',
      lines: [
        ['Spike', '50.00%', '40.00%'],
        ['Story', '50.00%', '60.00%'],
      ],
    },
    {
      name: 'Parent',
      lines: [['ADM-1002', '100.00%', '100.00%']],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Design',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Vulnerability',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [['Sprint 43', '100.00%', '100.00%']],
    },
    {
      name: 'Project',
      lines: [['Auto Dora Metrics', '100.00%', '100.00%']],
    },
    {
      name: 'Flagged',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Fix versions',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Priority',
      lines: [['High', '100.00%', '100.00%']],
    },
    {
      name: 'Partner',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [
        ['2.0', '50.00%', '40.00%'],
        ['3.0', '50.00%', '60.00%'],
      ],
    },
    {
      name: 'QA',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [['YinYuan Zhou', '100.00%', '100.00%']],
    },
  ],
  [
    {
      name: 'Issue Type',
      lines: [['Story', '100.00%', '100.00%']],
    },
    {
      name: 'Parent',
      lines: [['ADM-322', '100.00%', '100.00%']],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Design',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Vulnerability',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [['Sprint42', '100.00%', '100.00%']],
    },
    {
      name: 'Project',
      lines: [['Auto Dora Metrics', '100.00%', '100.00%']],
    },
    {
      name: 'Flagged',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Fix versions',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Priority',
      lines: [['Medium', '100.00%', '100.00%']],
    },
    {
      name: 'Partner',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [['1.0', '100.00%', '100.00%']],
    },
    {
      name: 'QA',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [['YinYuan Zhou', '100.00%', '100.00%']],
    },
  ],
  [
    {
      name: 'Issue Type',
      lines: [['Story', '100.00%', '100.00%']],
    },
    {
      name: 'Parent',
      lines: [
        ['ADM-322', '66.67%', '62.50%'],
        ['ADM-319', '33.33%', '37.50%'],
      ],
    },
    {
      name: 'Story testing-2',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Story testing-1',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Design',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Vulnerability',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Sprint',
      lines: [['Sprint42', '100.00%', '100.00%']],
    },
    {
      name: 'Project',
      lines: [['Auto Dora Metrics', '100.00%', '100.00%']],
    },
    {
      name: 'Flagged',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Fix versions',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Priority',
      lines: [['Medium', '100.00%', '100.00%']],
    },
    {
      name: 'Partner',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Labels',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Time tracking',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Story point estimate',
      lines: [
        ['2.0', '33.33%', '25.00%'],
        ['3.0', '66.67%', '75.00%'],
      ],
    },
    {
      name: 'QA',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Feature/Operation',
      lines: [['None', '100.00%', '100.00%']],
    },
    {
      name: 'Assignee',
      lines: [['YinYuan Zhou', '100.00%', '100.00%']],
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
      name: 'From review to in dev',
      value: '0 (times)',
    },
    {
      name: 'From waiting for testing to in dev',
      value: '0 (times)',
    },
    {
      name: 'From testing to in dev',
      value: '0 (times)',
    },
    {
      name: 'From done to in dev',
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
      value: '0 (times)',
    },
    {
      name: 'From block to in dev',
      value: '0 (times)',
    },
    {
      name: 'From review to in dev',
      value: '0 (times)',
    },
    {
      name: 'From waiting for testing to in dev',
      value: '0 (times)',
    },
    {
      name: 'From testing to in dev',
      value: '0 (times)',
    },
    {
      name: 'From done to in dev',
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
      value: '0 (times)',
    },
    {
      name: 'From block to in dev',
      value: '0 (times)',
    },
    {
      name: 'From review to in dev',
      value: '0 (times)',
    },
    {
      name: 'From waiting for testing to in dev',
      value: '0 (times)',
    },
    {
      name: 'From testing to in dev',
      value: '0 (times)',
    },
    {
      name: 'From done to in dev',
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
];

export const BOARD_CSV_COMPARED_LINES: ICsvComparedLines = {
  'board-20240826-20240902': 4,
  'board-20240812-20240818': 5,
  'board-20240819-20240825': 3,
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
  PrLeadTime: '0.00',
  PipelineLeadTime: '0.00',
  TotalLeadTime: '0.00',
  DeploymentFrequency: '0.00',
  FailureRate: '100.00% (1/1)',
  DevMeanTimeToRecovery: '0.00',
  DeploymentTimes: '0',
};

export const DORA_METRICS_RESULT_MULTIPLE_RANGES: IDoraMetricsResultItem[] = [
  {
    prLeadTime: '0.12',
    pipelineLeadTime: '0.40',
    totalLeadTime: '0.52',
    deploymentFrequency: '0.17',
    deploymentTimes: '1',
    failureRate: '0.00% (0/1)',
    pipelineMeanTimeToRecovery: '0.00',
  },
  {
    prLeadTime: '3.90',
    pipelineLeadTime: '0.44',
    totalLeadTime: '4.33',
    deploymentFrequency: '0.40',
    deploymentTimes: '2',
    failureRate: '33.33% (1/3)',
    pipelineMeanTimeToRecovery: '0.02',
  },
  {
    prLeadTime: '10.98',
    pipelineLeadTime: '0.43',
    totalLeadTime: '11.41',
    deploymentFrequency: '1.80',
    deploymentTimes: '9',
    failureRate: '0.00% (0/9)',
    pipelineMeanTimeToRecovery: '0.00',
  },
];

export const BOARD_METRICS_WITH_HOLIDAY_RESULT = {
  Velocity: '1',
  Throughput: '1',
  AverageCycleTime4SP: '0.98',
  AverageCycleTime4Card: '0.98',
  totalReworkTimes: '0',
  totalReworkCards: '0',
  reworkCardsRatio: '0.0000',
  throughput: '1',
};

export const DORA_METRICS_WITH_HOLIDAY_RESULT = {
  PrLeadTime: '45.48',
  PipelineLeadTime: '0.83',
  TotalLeadTime: '46.31',
  DeploymentFrequency: '1.00',
  FailureRate: '16.67% (1/6)',
  DevMeanTimeToRecovery: '0.78',
  DeploymentTimes: '5',
};

export const CYCLE_TIME_WITH_ANALYSIS_STATUS_PROJECT_BOARD_METRICS_RESULT: IBoardMetricsResult = {
  velocity: '8',
  throughput: '3',
  averageCycleTimeForSP: '0.73',
  averageCycleTimeForCard: '1.96',
  totalReworkTimes: '0',
  totalReworkCards: '0',
  reworkCardsRatio: '0.0000',
  reworkThroughput: '3',
};
