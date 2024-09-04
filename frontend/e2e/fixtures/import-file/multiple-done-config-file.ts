export const importMultipleDoneProjectFromFile = {
  projectName: 'Import project from file with all ranges API succeed',
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
  crews: ['Man Tang', 'YinYuan Zhou'],
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
  classification: [
    'issuetype',
    'parent',
    'customfield_10061',
    'customfield_10062',
    'customfield_10063',
    'customfield_10020',
    'project',
    'customfield_10021',
    'fixVersions',
    'priority',
    'customfield_10037',
    'labels',
    'timetracking',
    'customfield_10016',
    'customfield_10038',
    'assignee',
    'customfield_10027',
    'customfield_10060',
  ],
  classificationCharts: ['issuetype', 'assignee'],
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
  pipelineCrews: ['Yufan0226', 'Zhongren GU', 'guzhongren', 'renovate[bot]', 'zhou-yinyuan', 'Unknown'],
};
