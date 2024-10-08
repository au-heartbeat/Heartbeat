export const cycleTimeByStatusFixture = {
  projectName: 'Heartbeat Metrics',
  dateRange: {
    startDate: '2024-03-27T00:00:00.000+08:00',
    endDate: '2024-03-29T23:59:59.999+08:00',
  },
  calendarType: 'CN',
  metrics: [
    'All',
    'Velocity',
    'Cycle time',
    'Classification',
    'Rework times',
    'Lead time for changes',
    'Deployment frequency',
    'Dev change failure rate',
    'Dev mean time to recovery',
  ],
  board: {
    type: 'Jira',
    boardId: '31',
    email: 'heartbeatuser2023@gmail.com',
    projectKey: 'ADM',
    site: 'dorametrics',
    token: process.env.E2E_TOKEN_JIRA,
  },
  pipelineTool: {
    type: 'BuildKite',
    token: process.env.E2E_TOKEN_BUILD_KITE,
  },
  pipelineCrews: ['heartbeat-user', 'Unknown'],
  sourceControl: {
    type: 'GitHub',
    token: process.env.E2E_TOKEN_GITHUB,
  },
  crews: ['heartbeat user', 'Chao Wang', 'Junbo Dai'],
  assigneeFilter: 'lastAssignee',
  cycleTime: {
    type: 'byStatus',
    jiraColumns: [
      {
        TODO: '----',
      },
      {
        Doing: '----',
      },
      {
        Blocked: '----',
      },
      {
        Review: '----',
      },
      {
        'WAIT FOR TEST': '----',
      },
      {
        Testing: '----',
      },
      {
        Done: '----',
      },
    ],
    treatFlagCardAsBlock: true,
  },
  doneStatus: ['DONE'],
  classification: [
    'issuetype',
    'parent',
    'customfield_10064',
    'project',
    'customfield_10021',
    'reporter',
    'labels',
    'customfield_10016',
    'assignee',
    'customfield_10062',
  ],
  classificationCharts: ['issuetype', 'assignee'],
  deployment: [
    {
      id: 0,
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
};
