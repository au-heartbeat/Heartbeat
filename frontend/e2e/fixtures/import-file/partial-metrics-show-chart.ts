export const partialMetricsShowChart = {
  projectName: 'Heartbeat Metrics',
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
  calendarType: 'Calendar with Chinese Holiday',
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
  crews: ['heartbeat user', 'Weiran Sun', 'Yufan Wang', 'Xinyi Wang', 'Xuebing Li', 'Junbo Dai', 'Yunsong Yang'],
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
      organization: 'Thoughtworks-Heartbeat',
      pipelineName: 'Heartbeat',
      step: ':rocket: Deploy prod',
      branches: ['main'],
      isStepEmptyString: false,
    },
  ],
  reworkTimesSettings: {
    reworkState: 'In Dev',
    excludeStates: [],
  },
  pipelineCrews: [
    'Andrea2000728',
    'BoBoDai',
    'JiangRu1',
    'SimonTal',
    'davidwangcn9',
    'gabralia',
    'guzhongren',
    'lxuebing',
    'mikeyangyun',
    'mjx20045912',
    'mrcuriosity-tw',
    'neomgb',
    'sqsq5566',
    'weiraneve',
    'Unknown',
    'Jianxun.Ma',
    'wenjing-qi',
    'Yunsong',
  ],
};
