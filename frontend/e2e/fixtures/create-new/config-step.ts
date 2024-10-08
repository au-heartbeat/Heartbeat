export const config = {
  projectName: 'Heartbeat Metrics',
  dateRange: [
    {
      startDate: '2024-08-26T00:00:00.000+08:00',
      endDate: '2024-09-02T23:59:59.999+08:00',
    },
    {
      startDate: '2024-08-19T00:00:00.000+08:00',
      endDate: '2024-08-25T23:59:59.999+08:00',
    },
    {
      startDate: '2024-08-12T00:00:00.000+08:00',
      endDate: '2024-08-18T23:59:59.999+08:00',
    },
  ],
  sortType: 'DEFAULT',
  calendarType: 'CN',
  metrics: [
    'Velocity',
    'Cycle time',
    'Classification',
    'Rework times',
    'Lead time for changes',
    'Deployment frequency',
    'Pipeline change failure rate',
    'Pipeline mean time to recovery',
  ],
  board: {
    type: 'Jira',
    boardId: '2',
    email: 'heartbeatuser2023@gmail.com',
    site: 'dorametrics',
    token: process.env.E2E_TOKEN_JIRA as string,
  },
  pipelineTool: {
    type: 'BuildKite',
    token: process.env.E2E_TOKEN_BUILD_KITE as string,
  },
  sourceControl: {
    type: 'GitHub',
    token: process.env.E2E_TOKEN_GITHUB as string,
  },
};

export const configWithoutBlockColumn = {
  projectName: 'Heartbeat Metrics',
  dateRange: [
    {
      startDate: '2024-04-07T00:00:00.000+08:00',
      endDate: '2024-04-08T23:59:59.999+08:00',
    },
    {
      startDate: '2024-04-09T00:00:00.000+08:00',
      endDate: '2024-04-10T23:59:59.999+08:00',
    },
    {
      startDate: '2024-04-11T00:00:00.000+08:00',
      endDate: '2024-04-12T23:59:59.999+08:00',
    },
  ],
  sortType: 'DEFAULT',
  calendarType: 'CN',
  metrics: ['Cycle time'],
  board: {
    type: 'Jira',
    boardId: '33',
    email: 'heartbeatuser2023@gmail.com',
    site: 'dorametrics',
    token: process.env.E2E_TOKEN_JIRA as string,
  },
};
