const TREND_GREEN = 'rgb(0, 128, 0)';
const TREND_RED = 'rgb(255, 0, 0)';

export const BOARD_CHART_VALUE = {
  Velocity: {
    type: 'trend up',
    color: TREND_GREEN,
    value: '160.00%',
  },
  'Average Cycle Time': {
    type: 'trend up',
    color: TREND_RED,
    value: '75.25%',
  },
  'Cycle Time Allocation': {
    type: 'trend up',
    color: TREND_GREEN,
    value: '355.89%',
  },
  Rework: {
    type: 'trend up',
    color: TREND_RED,
    value: '266.67%',
  },
};

export const DORA_CHART_VALUE = {
  'Lead Time For Changes': {
    type: 'trend down',
    color: TREND_GREEN,
    value: '-40.28%',
  },
  'Deployment Frequency': {
    type: 'trend down',
    color: TREND_RED,
    value: '-6.67%',
  },
  'Dev Change Failure Rate': {
    type: 'trend down',
    color: TREND_GREEN,
    value: '-59.99%',
  },
  'Dev Mean Time To Recovery': {
    type: 'trend down',
    color: TREND_GREEN,
    value: '-22.19%',
  },
};
