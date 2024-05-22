export const calculateWithHolidayConfigFile = {
  projectName: 'Heartbeat Metrics',
  dateRange: {
    startDate: '2024-04-10T00:00:00.000+08:00',
    endDate: '2024-05-10T23:59:59.999+08:00',
  },
  calendarType: 'Calendar with Chinese Holiday',
  metrics: [
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
    token: process.env.E2E_TOKEN_JIRA,
    site: 'dorametrics',
  },
  pipelineTool: {
    type: 'BuildKite',
    token: process.env.E2E_TOKEN_BUILD_KITE,
  },
  sourceControl: {
    type: 'GitHub',
    token: process.env.E2E_TOKEN_GITHUB,
  },
  crews: ['heartbeat user', 'Yao Zhang', 'Weiran Sun', 'Chao Wang', 'Junbo Dai', 'Yufan Wang', 'Shiqi Yuan'],
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
    'project',
    'fixVersions',
    'customfield_10037',
    'timetracking',
    'customfield_10061',
    'customfield_10062',
    'customfield_10063',
    'customfield_10020',
    'customfield_10021',
    'priority',
    'labels',
    'customfield_10016',
    'customfield_10038',
    'assignee',
    'customfield_10027',
    'customfield_10060',
  ],
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
};
