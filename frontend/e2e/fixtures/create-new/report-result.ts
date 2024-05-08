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

export const BOARD_METRICS_RESULT_MULTIPLE_TIMES: IBoardMetricsResult[] = [
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
