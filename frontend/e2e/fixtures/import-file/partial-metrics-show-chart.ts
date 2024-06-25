export const partialMetricsShowChart = {
  projectName: 'Partial Metrics',
  dateRange: [
    {
      startDate: '2024-01-15T00:00:00.000+08:00',
      endDate: '2024-01-16T23:59:59.999+08:00',
    },
    {
      startDate: '2024-01-17T00:00:00.000+08:00',
      endDate: '2024-01-18T23:59:59.999+08:00',
    },
    {
      startDate: '2024-01-19T00:00:00.000+08:00',
      endDate: '2024-01-19T23:59:59.999+08:00',
    },
  ],
  calendarType: 'CN',
  metrics: ['Velocity', 'Cycle time', 'Lead time for changes', 'Dev mean time to recovery'],
  board: {
    type: 'Jira',
    boardId: '2',
    email: 'heartbeatuser2023@gmail.com',
    projectKey: 'ADM',
    site: 'dorametrics',
    token: process.env.E2E_TOKEN_JIRA,
  },
  pipelineTool: {
    type: 'BuildKite',
    token: process.env.E2E_TOKEN_BUILD_KITE,
  },
  sourceControl: {
    type: 'GitHub',
    token: process.env.E2E_TOKEN_GITHUB,
  },
  crews: ['Man Tang', 'heartbeat user', 'Qiuhong Lei', 'Chao Wang', 'YinYuan Zhou'],
  assigneeFilter: 'lastAssignee',
  cycleTime: {
    type: 'byColumn',
    jiraColumns: [
      {
        TODO: 'To do',
      },
      {
        Doing: 'In Dev',
      },
      {
        Blocked: 'Block',
      },
      {
        Review: 'Review',
      },
      {
        'READY FOR TESTING': 'Waiting for testing',
      },
      {
        Testing: 'Testing',
      },
      {
        Done: 'Done',
      },
    ],
    treatFlagCardAsBlock: true,
  },
  doneStatus: ['DONE'],
  classification: [],
  deployment: [
    {
      id: 0,
      isStepEmptyString: false,
      organization: 'Heartbeat-backup',
      pipelineName: 'Heartbeat',
      step: ':rocket: Deploy prod',
      branches: ['main'],
    },
  ],
  reworkTimesSettings: {
    reworkState: 'In Dev',
    excludeStates: [],
  },
  pipelineCrews: ['Mandy-Tang', 'guzhongren', 'zhou-yinyuan', 'Unknown', 'davidwangcn9'],
};
