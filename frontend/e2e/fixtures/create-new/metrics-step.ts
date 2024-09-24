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
  reworkTimesSettings: {
    excludeStates: [] as string[],
    reworkState: 'In Dev' as string,
  },
  sourceControl: {
    type: 'GitHub',
    token: process.env.E2E_TOKEN_GITHUB as string,
  },
  crews: ['Man Tang', 'YinYuan Zhou'],
  assigneeFilter: 'lastAssignee',
  pipelineCrews: ['Yufan0226', 'Zhongren GU', 'guzhongren', 'renovate[bot]', 'zhou-yinyuan', 'Unknown'],
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
    treatFlagCardAsBlock: false,
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
  advancedSettings: null,
  deployment: [
    {
      id: 0,
      isStepEmptyString: true,
      organization: 'Heartbeat-backup',
      pipelineName: 'Heartbeat',
      step: ':rocket: Deploy prod',
      repoName: 'au-heartbeat/Heartbeat',
      branches: ['main'],
    },
  ],
};

export const modifiedConfig = {
  projectName: 'Heartbeat Metrics',
  dateRange: {
    startDate: '2024-01-15T00:00:00.000+08:00',
    endDate: '2024-01-19T23:59:59.999+08:00',
  },
  sortType: 'DEFAULT',
  calendarType: 'CN',
  metrics: [
    'Velocity',
    'Cycle time',
    'Classification',
    'Lead time for changes',
    'Deployment frequency',
    'Dev change failure rate',
    'Dev mean time to recovery',
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
  reworkTimesSettings: {
    excludeStates: ['Block', 'Testing'] as string[],
    reworkState: 'To do' as string,
  },
  sourceControl: {
    type: 'GitHub',
    token: process.env.E2E_TOKEN_GITHUB as string,
  },
  crews: ['Man Tang', 'YinYuan Zhou'],
  assigneeFilter: 'lastAssignee',
  pipelineCrews: ['Yufan0226', 'Zhongren GU', 'guzhongren', 'renovate[bot]', 'zhou-yinyuan', 'Unknown'],
  cycleTime: {
    type: 'byStatus',
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
      repoName: 'au-heartbeat/Heartbeat',
      step: ':rocket: Deploy prod',
      branches: ['main'],
    },
  ],
};

export const configWithoutBlockColumn = {
  crews: ['Shiqi Yuan'],
  cycleTime: {
    type: 'byColumn',
    jiraColumns: [
      {
        'TO DO': 'To do',
      },
      {
        'IN DEV': 'In Dev',
      },
      {
        'WAITING FOR TESTING': 'Waiting for testing',
      },
      {
        Done: 'Done',
      },
    ],
  },
  reworkTimesSettings: { excludeStates: [], reworkState: 'In Dev' },
};

export const configWithDesignAndWaitingForDevelopmentStatus = {
  ...config,
  cycleTime: {
    type: 'byColumn',
    jiraColumns: [
      {
        TODO: 'Design',
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
        'READY FOR TESTING': 'Waiting for deployment',
      },
      {
        Testing: 'Testing',
      },
      {
        Done: 'Done',
      },
    ],
    treatFlagCardAsBlock: false,
  },
};

export const sourceControlConfigurationSettings = [
  {
    id: 1,
    organization: 'au-heartbeat',
    repo: 'Heartbeat',
    branches: ['main'],
  },
];
