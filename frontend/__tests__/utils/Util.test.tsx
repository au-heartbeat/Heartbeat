import {
  calculateTrendInfo,
  combineBoardInfo,
  convertCycleTimeSettings,
  exportToJsonFile,
  filterAndMapCycleTimeSettings,
  findCaseInsensitiveType,
  formatDuplicatedNameWithSuffix,
  formatMillisecondsToHours,
  formatMinToHours,
  getDeviceSize,
  getDisabledOptions,
  getJiraBoardToken,
  getRealDoneStatus,
  getSortedAndDeduplicationBoardingMapping,
  percentageFormatter,
  sortDateRanges,
  sortDisabledOptions,
  sortReportInfos,
  transformToCleanedBuildKiteEmoji,
  updateResponseCrews,
  valueFormatter,
  xAxisLabelDateFormatter,
} from '@src/utils/util';
import {
  ChartType,
  CycleTimeSettingsTypes,
  DOWN_TREND_IS_BETTER,
  METRICS_CONSTANTS,
  TrendIcon,
  TrendType,
  UP_TREND_IS_BETTER,
} from '@src/constants/resources';
import { ICycleTimeSetting, IPipelineConfig, ISourceControlConfig } from '@src/context/Metrics/metricsSlice';
import { CleanedBuildKiteEmoji, OriginBuildKiteEmoji } from '@src/constants/emojis/emoji';
import { IPipeline } from '@src/context/config/pipelineTool/verifyResponseSlice';
import { IReportInfo } from '@src/hooks/useGenerateReportEffect';
import { BoardInfoResponse } from '@src/hooks/useGetBoardInfo';
import { EMPTY_STRING } from '@src/constants/commons';
import { PIPELINE_TOOL_TYPES } from '../fixtures';

describe('exportToJsonFile function', () => {
  it('should create a link element with the correct attributes and click it', () => {
    const filename = 'test';
    const json = { key: 'value' };
    const documentCreateSpy = jest.spyOn(document, 'createElement');

    exportToJsonFile(filename, json);

    expect(documentCreateSpy).toHaveBeenCalledWith('a');
  });
});

describe('transformToCleanedBuildKiteEmoji function', () => {
  it('should transform to cleaned emoji', () => {
    const mockOriginEmoji: OriginBuildKiteEmoji = {
      name: 'zap',
      image: 'abc.com',
      aliases: [],
    };

    const expectedCleanedEmoji: CleanedBuildKiteEmoji = {
      image: 'abc.com',
      aliases: ['zap'],
    };

    const [result] = transformToCleanedBuildKiteEmoji([mockOriginEmoji]);

    expect(result).toEqual(expectedCleanedEmoji);
  });
});

describe('getDisabledOptions function', () => {
  it('should return true when option is includes', () => {
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [
      { id: 0, organization: '', pipelineName: 'mock 1', step: '', repoName: '', branches: [] },
      { id: 1, organization: '', pipelineName: 'mock 2', step: '', repoName: '', branches: [] },
    ];

    const mockOption: string = 'mock 1';

    const result = getDisabledOptions(mockDeploymentFrequencySettings, mockOption, mockDeploymentFrequencySettings);

    expect(result).toBeTruthy();
  });

  it('should return false when option is not includes', () => {
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [
      { id: 0, organization: '', pipelineName: 'mock 1', step: '', repoName: '', branches: [] },
      { id: 1, organization: '', pipelineName: 'mock 2', step: '', repoName: '', branches: [] },
    ];

    const mockOption: string = 'mock 3';

    const result = getDisabledOptions(mockDeploymentFrequencySettings, mockOption, mockDeploymentFrequencySettings);

    expect(result).toBeFalsy();
  });

  it('should return true when option is includes and receive ISourceControlConfig data', () => {
    const mockSourceControlConfigSettings: ISourceControlConfig[] = [
      { id: 0, organization: '', repo: 'mock 1', branches: [] },
      { id: 1, organization: '', repo: 'mock 2', branches: [] },
    ];
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [
      { id: 0, organization: '', pipelineName: 'mock 1', step: '', repoName: '', branches: [] },
      { id: 1, organization: '', pipelineName: 'mock 2', step: '', repoName: '', branches: [] },
    ];

    const mockOption: string = 'mock 1';

    const result = getDisabledOptions(mockSourceControlConfigSettings, mockOption, mockDeploymentFrequencySettings);

    expect(result).toBeTruthy();
  });

  it('should return false when option is not includes and receive ISourceControlConfig data', () => {
    const mockSourceControlConfigSettings: ISourceControlConfig[] = [
      { id: 0, organization: '', repo: 'mock 1', branches: [] },
      { id: 1, organization: '', repo: 'mock 2', branches: [] },
    ];
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [
      { id: 0, organization: '', pipelineName: 'mock 1', step: '', repoName: '', branches: [] },
      { id: 1, organization: '', pipelineName: 'mock 2', step: '', repoName: '', branches: [] },
    ];

    const mockOption: string = 'mock 3';

    const result = getDisabledOptions(mockSourceControlConfigSettings, mockOption, mockDeploymentFrequencySettings);

    expect(result).toBeFalsy();
  });
});

describe('sortDisabledOptions function', () => {
  it('should sort the mock3 is first when mock1 & mock2 is selected', () => {
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [
      { id: 0, organization: '', pipelineName: 'mock1', step: '', repoName: '', branches: [] },
      { id: 1, organization: '', pipelineName: 'mock2', step: '', repoName: '', branches: [] },
    ];

    const mockOptions = ['mock1', 'mock2', 'mock3'];

    const result = sortDisabledOptions(mockDeploymentFrequencySettings, mockOptions, mockDeploymentFrequencySettings);

    expect(result).toEqual(['mock3', 'mock1', 'mock2']);
  });

  it('should not sort when deploymentFrequencySettings is empty', () => {
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [];

    const mockOptions = ['mock1', 'mock2', 'mock3'];

    const result = sortDisabledOptions(mockDeploymentFrequencySettings, mockOptions, mockDeploymentFrequencySettings);

    expect(result).toEqual(['mock1', 'mock2', 'mock3']);
  });

  it('should as is when selected option is last', () => {
    const mockDeploymentFrequencySettings: IPipelineConfig[] = [
      { id: 0, organization: '', pipelineName: 'mock3', step: '', repoName: '', branches: [] },
    ];

    const mockOptions = ['mock1', 'mock2', 'mock3'];

    const result = sortDisabledOptions(mockDeploymentFrequencySettings, mockOptions, mockDeploymentFrequencySettings);

    expect(result).toEqual(['mock1', 'mock2', 'mock3']);
  });
});

describe('getJiraToken function', () => {
  it('should return an valid string when token is not empty string', () => {
    const email = 'test@example.com';
    const token = 'myToken';

    const jiraToken = getJiraBoardToken(token, email);
    const encodedMsg = `Basic ${btoa(`${email}:${token}`)}`;

    expect(jiraToken).toBe(encodedMsg);
  });

  it('should return an empty string when token is missing', () => {
    const email = 'test@example.com';
    const token = '';

    const jiraToken = getJiraBoardToken(token, email);

    expect(jiraToken).toBe('');
  });
});

describe('findCaseInsensitiveType function', () => {
  it('Should return "BuildKite" when passing a type given case insensitive input bUildkite', () => {
    const selectedValue = 'bUildkite';
    const value = findCaseInsensitiveType(Object.values(PIPELINE_TOOL_TYPES), selectedValue);
    expect(value).toBe(PIPELINE_TOOL_TYPES.BUILD_KITE);
  });

  it('Should return "_BuildKite" when passing a type given the value mismatches with PIPELINE_TOOL_TYPES', () => {
    const selectedValue = '_BuildKite';
    const value = findCaseInsensitiveType(Object.values(PIPELINE_TOOL_TYPES), selectedValue);
    expect(value).not.toBe(PIPELINE_TOOL_TYPES.BUILD_KITE);
    expect(value).toBe(selectedValue);
  });

  it('Should return empty string when passing a type given empty string', () => {
    const selectedValue = '';
    const value = findCaseInsensitiveType(Object.values(PIPELINE_TOOL_TYPES), selectedValue);
    expect(value).toBe(EMPTY_STRING);
  });
});

describe('filterAndMapCycleTimeSettings function', () => {
  it('should filter and map CycleTimeSettings when generate report', () => {
    const MOCK_CYCLE_TIME_SETTING = [
      { column: 'TODO', status: 'ToDo', value: 'TODO' },
      { column: 'TODO', status: 'Backlog', value: 'TODO' },
      { column: 'IN DEV', status: 'InDev', value: 'IN DEV' },
      { column: 'IN DEV', status: 'Doing', value: 'IN DEV' },
      { column: 'DONE', status: 'Done', value: 'DONE' },
    ];
    const value = filterAndMapCycleTimeSettings(MOCK_CYCLE_TIME_SETTING);

    expect(value).toStrictEqual([
      { name: 'ToDo', value: 'TODO' },
      { name: 'Backlog', value: 'TODO' },
      { name: 'InDev', value: 'IN DEV' },
      { name: 'Doing', value: 'IN DEV' },
      { name: 'Done', value: 'DONE' },
    ]);
  });

  it('Should return 2 hours when passing a min', () => {
    const expected = 2;
    const result = formatMinToHours(120);
    expect(result).toEqual(expected);
  });

  it('Should return 2 hours when passing a Milliseconds', () => {
    const expected = 2;
    const result = formatMillisecondsToHours(7200000);
    expect(result).toEqual(expected);
  });
});

const MOCK_CYCLE_TIME_SETTING_With_ONE_DONE = [
  { column: 'TODO', status: 'ToDo', value: 'TODO' },
  { column: 'TODO', status: 'Backlog', value: 'TODO' },
  { column: 'IN DEV', status: 'InDev', value: 'IN DEV' },
  { column: 'IN DEV', status: 'Doing', value: 'IN DEV' },
  { column: 'DONE', status: 'DONE', value: 'Done' },
];

const MOCK_CYCLE_TIME_SETTING_WITH_MUTIPLE_DONE = [
  { column: 'TODO', status: 'ToDo', value: 'TODO' },
  { column: 'TODO', status: 'Backlog', value: 'TODO' },
  { column: 'IN DEV', status: 'InDev', value: 'IN DEV' },
  { column: 'IN DEV', status: 'Doing', value: 'Done' },
  { column: 'DONE', status: 'DONE', value: 'Done' },
];

describe('getRealDoneStatus', () => {
  it('should return selected done status given cycle time settings only one done value and type is by column', () => {
    const result = getRealDoneStatus(MOCK_CYCLE_TIME_SETTING_With_ONE_DONE, CycleTimeSettingsTypes.BY_COLUMN, []);

    expect(result).toEqual(['DONE']);
  });

  it('should return selected done status given cycle time settings only one done value and type is by status', () => {
    const result = getRealDoneStatus(MOCK_CYCLE_TIME_SETTING_With_ONE_DONE, CycleTimeSettingsTypes.BY_STATUS, []);

    expect(result).toEqual(['DONE']);
  });

  it('should return status from real done settings given cycle time settings type is by column', () => {
    const result = getRealDoneStatus(MOCK_CYCLE_TIME_SETTING_WITH_MUTIPLE_DONE, CycleTimeSettingsTypes.BY_COLUMN, [
      'Doing',
    ]);

    expect(result).toEqual(['Doing']);
  });

  it('should return selected done status given cycle time settings type is by column', () => {
    const result = getRealDoneStatus(MOCK_CYCLE_TIME_SETTING_WITH_MUTIPLE_DONE, CycleTimeSettingsTypes.BY_STATUS, [
      'something',
    ]);

    expect(result).toEqual(['Doing', 'DONE']);
  });
});

describe('formatDuplicatedNameWithSuffix function', () => {
  it('should add suffix for duplicated name', () => {
    const duplicatedName = 'Story testing';
    const basicTargetFields = [
      { flag: true, key: 'issue', name: 'Issue' },
      { flag: false, key: 'type', name: 'Type' },
    ];
    const mockTargetFields = [
      ...basicTargetFields,
      { flag: true, key: 'custom_field10060', name: duplicatedName },
      { flag: false, key: 'custom_field10061', name: duplicatedName },
    ];

    const result = formatDuplicatedNameWithSuffix(mockTargetFields);

    const expectResult = [
      ...basicTargetFields,
      { flag: true, key: 'custom_field10060', name: `${duplicatedName}-1` },
      { flag: false, key: 'custom_field10061', name: `${duplicatedName}-2` },
    ];
    expect(result).toStrictEqual(expectResult);
  });
});

describe('getSortedAndDeduplicationBoardingMapping function', () => {
  it('should sorted and deduplication boarding mapping', () => {
    const boardingMapping: ICycleTimeSetting[] = [
      METRICS_CONSTANTS.cycleTimeEmptyStr,
      METRICS_CONSTANTS.analysisValue,
      METRICS_CONSTANTS.testingValue,
      METRICS_CONSTANTS.doneValue,
      METRICS_CONSTANTS.todoValue,
      METRICS_CONSTANTS.cycleTimeEmptyStr,
      METRICS_CONSTANTS.blockValue,
      METRICS_CONSTANTS.inDevValue,
      METRICS_CONSTANTS.reviewValue,
      METRICS_CONSTANTS.waitingForTestingValue,
      METRICS_CONSTANTS.reviewValue,
    ].map((value) => ({
      value: value,
      status: '',
      column: '',
    }));
    const expectResult = [
      METRICS_CONSTANTS.cycleTimeEmptyStr,
      METRICS_CONSTANTS.todoValue,
      METRICS_CONSTANTS.analysisValue,
      METRICS_CONSTANTS.inDevValue,
      METRICS_CONSTANTS.blockValue,
      METRICS_CONSTANTS.reviewValue,
      METRICS_CONSTANTS.waitingForTestingValue,
      METRICS_CONSTANTS.testingValue,
      METRICS_CONSTANTS.doneValue,
    ];
    const result = getSortedAndDeduplicationBoardingMapping(boardingMapping);
    expect(result).toStrictEqual(expectResult);
  });
});

describe('convertCycleTimeSettings function', () => {
  const mockCycleTime = [
    {
      column: 'TODO',
      status: 'TODO',
      value: 'To do',
    },
    {
      column: 'Doing',
      status: 'DOING',
      value: 'In Dev',
    },
    {
      column: 'Blocked',
      status: 'BLOCKED',
      value: 'Block',
    },
    {
      column: 'Review',
      status: 'REVIEW',
      value: 'Review',
    },
    {
      column: 'READY FOR TESTING',
      status: 'WAIT FOR TEST',
      value: 'Waiting for testing',
    },
    {
      column: 'Testing',
      status: 'TESTING',
      value: 'Testing',
    },
    {
      column: 'Done',
      status: 'DONE',
      value: '',
    },
  ];
  it('convert cycle time settings correctly by status', () => {
    const expectResult = [
      {
        TODO: 'To do',
      },
      {
        DOING: 'In Dev',
      },
      {
        BLOCKED: 'Block',
      },
      {
        REVIEW: 'Review',
      },
      {
        'WAIT FOR TEST': 'Waiting for testing',
      },
      {
        TESTING: 'Testing',
      },
      {
        DONE: '',
      },
    ];
    const result = convertCycleTimeSettings(CycleTimeSettingsTypes.BY_STATUS, mockCycleTime);
    expect(result).toStrictEqual(expectResult);
  });
  it('convert cycle time settings correctly by column', () => {
    const expectResult = [
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
        Done: '----',
      },
    ];
    const result = convertCycleTimeSettings(CycleTimeSettingsTypes.BY_COLUMN, mockCycleTime);
    expect(result).toStrictEqual(expectResult);
  });
});

describe('sortDateRanges function', () => {
  const dateRanges = [
    {
      startDate: '2024-03-19T00:00:00.000+08:00',
      endDate: '2024-03-21T23:59:59.999+08:00',
    },
    {
      startDate: '2024-02-01T00:00:00.000+08:00',
      endDate: '2024-02-14T23:59:59.999+08:00',
    },
    {
      startDate: '2024-04-01T00:00:00.000+08:00',
      endDate: '2024-04-08T23:59:59.999+08:00',
    },
  ];
  const expectResult = [
    {
      startDate: '2024-04-01T00:00:00.000+08:00',
      endDate: '2024-04-08T23:59:59.999+08:00',
    },
    {
      startDate: '2024-03-19T00:00:00.000+08:00',
      endDate: '2024-03-21T23:59:59.999+08:00',
    },
    {
      startDate: '2024-02-01T00:00:00.000+08:00',
      endDate: '2024-02-14T23:59:59.999+08:00',
    },
  ];
  it('should descend dateRanges', () => {
    const sortedDateRanges = sortDateRanges(dateRanges);
    expect(sortedDateRanges).toStrictEqual(expectResult);
  });

  it('should ascend dateRanges', () => {
    const sortedDateRanges = sortDateRanges(dateRanges, false);
    expect(sortedDateRanges).toStrictEqual(expectResult.reverse());
  });
});

describe('sortReportInfos function', () => {
  const reportInfos = [
    {
      id: '2024-03-19T00:00:00.000+08:00',
      reportData: {},
    },
    {
      id: '2024-02-01T00:00:00.000+08:00',
      reportData: {},
    },
    {
      id: '2024-04-01T00:00:00.000+08:00',
      reportData: {},
    },
  ];
  const expectResult = [
    {
      id: '2024-04-01T00:00:00.000+08:00',
      reportData: {},
    },
    {
      id: '2024-03-19T00:00:00.000+08:00',
      reportData: {},
    },
    {
      id: '2024-02-01T00:00:00.000+08:00',
      reportData: {},
    },
  ];
  it('should descend reportInfos', () => {
    const sortedReportInfos = sortReportInfos(reportInfos as IReportInfo[]);
    expect(sortedReportInfos).toStrictEqual(expectResult);
  });

  it('should ascend reportInfos', () => {
    const sortedReportInfos = sortReportInfos(reportInfos as IReportInfo[], false);
    expect(sortedReportInfos).toStrictEqual(expectResult.reverse());
  });
});

describe('combineBoardInfo function', () => {
  const boardInfoResponses: BoardInfoResponse[] = [
    {
      ignoredTargetFields: [
        {
          key: 'description',
          name: 'Description',
          flag: 'false',
        },
        {
          key: 'customfield_10015',
          name: 'Start date',
          flag: 'false',
        },
      ],
      jiraColumns: [
        {
          key: 'To Do',
          value: '{ name: TODO, statuses: [TODO]}',
        },
        {
          key: 'In Progress',
          value: '{ name: DOING, statuses: [DOING]}',
        },
      ],
      targetFields: [
        {
          key: 'issuetype',
          name: 'Issue Type',
          flag: 'false',
        },
        {
          key: 'parent',
          name: 'Parent',
          flag: 'false',
        },
      ],
      users: ['heartbeat user', 'Yunsong Yang'],
    },
    {
      ignoredTargetFields: [
        {
          key: 'description',
          name: 'Description',
          flag: 'false',
        },
        {
          key: 'customfield_10015',
          name: 'Start date',
          flag: 'false',
        },
      ],
      jiraColumns: [
        {
          key: 'To Do',
          value: '{ name: TODO, statuses: [TODO]}',
        },
        {
          key: 'In Progress',
          value: '{ name: DOING, statuses: [DOING]}',
        },
      ],
      targetFields: [
        {
          key: 'issuetype',
          name: 'Issue Type',
          flag: 'false',
        },
        {
          key: 'parent',
          name: 'Parent',
          flag: 'false',
        },
      ],
      users: [
        'heartbeat user',
        'Yunsong Yang',
        'Yufan Wang',
        'Weiran Sun',
        'Xuebing Li',
        'Junbo Dai',
        'Wenting Yan',
        'Xingmeng Tao',
      ],
    },
  ];
  const expectResults = {
    ignoredTargetFields: [
      {
        key: 'description',
        name: 'Description',
        flag: 'false',
      },
      {
        key: 'customfield_10015',
        name: 'Start date',
        flag: 'false',
      },
    ],
    jiraColumns: [
      {
        key: 'To Do',
        value: '{ name: TODO, statuses: [TODO]}',
      },
      {
        key: 'In Progress',
        value: '{ name: DOING, statuses: [DOING]}',
      },
    ],
    targetFields: [
      {
        key: 'issuetype',
        name: 'Issue Type',
        flag: 'false',
      },
      {
        key: 'parent',
        name: 'Parent',
        flag: 'false',
      },
    ],
    users: [
      'heartbeat user',
      'Yunsong Yang',
      'Yufan Wang',
      'Weiran Sun',
      'Xuebing Li',
      'Junbo Dai',
      'Wenting Yan',
      'Xingmeng Tao',
    ],
  };

  it('should combine board info', () => {
    const combineBoardData = combineBoardInfo(boardInfoResponses);
    expect(combineBoardData).toStrictEqual(expectResults);
  });
});

describe('updateResponseCrews function', () => {
  const mockData = {
    id: '0',
    name: 'pipelineName',
    orgId: '',
    orgName: 'orgName',
    repository: '',
    steps: [] as string[],
    branches: [] as string[],
    crews: ['a', 'b', 'c'],
  } as IPipeline;
  it('should update crews when pipelineName and org both matched', () => {
    const expectData = [
      {
        ...mockData,
        crews: [],
      },
    ];
    const result = updateResponseCrews('orgName', 'pipelineName', [mockData]);
    expect(result).toEqual(expectData);
  });

  it('should not update crews when pipelineName or org not matched', () => {
    const expectData = [
      {
        ...mockData,
      },
    ];
    const result = updateResponseCrews('xxx', 'xxx', [mockData]);
    expect(result).toEqual(expectData);
  });
});

describe('xAxisLabelDateFormatter function', () => {
  it('should show the correct date format', () => {
    const inputDate = '2024/01/15-2024/01/19';

    const result = xAxisLabelDateFormatter(inputDate);

    expect(result).toEqual('01/15-01/19');
  });
});

describe('calculateTrendInfo function', () => {
  const dateRangeList = [
    '2024/01/15-2024/01/19',
    '2024/01/20-2024/01/21',
    '2024/01/22-2024/01/23',
    '2024/01/24-2024/01/25',
  ];

  it('should only return type given the data list is undefined', () => {
    const result = calculateTrendInfo(undefined, dateRangeList, ChartType.Velocity);

    expect(result.dateRangeList).toEqual(undefined);
    expect(result.trendNumber).toEqual(undefined);
    expect(result.trendType).toEqual(undefined);
    expect(result.icon).toEqual(undefined);
    expect(result.type).toEqual(ChartType.Velocity);
  });

  // it.each([
  //   [0, 0, 3, 0],
  //   [0, 0, 0, 0],
  //   [0, 0, 0, 3]
  // ])(
  //   'should only return type given the data is invalid', (dataList: number[]) => {
  //     const result = calculateTrendInfo(dataList, dateRangeList, ChartType.Velocity);
  //
  //     expect(result.dateRangeList).toEqual(undefined);
  //     expect(result.trendNumber).toEqual(undefined);
  //     expect(result.trendType).toEqual(undefined);
  //     expect(result.icon).toEqual(undefined);
  //     expect(result.type).toEqual(ChartType.Velocity);
  //   })

  it('should only return type given the last value is zero in the data list', () => {
    const dataList = [0, 0, 3, 0];
    const result = calculateTrendInfo(dataList, dateRangeList, ChartType.Velocity);

    expect(result.dateRangeList).toEqual(undefined);
    expect(result.trendNumber).toEqual(undefined);
    expect(result.trendType).toEqual(undefined);
    expect(result.icon).toEqual(undefined);
    expect(result.type).toEqual(ChartType.Velocity);
  });

  it('should only return type given the last second value is zero in the data list', () => {
    const dataList = [0, 0, 0, 3];
    const result = calculateTrendInfo(dataList, dateRangeList, ChartType.Velocity);

    expect(result.dateRangeList).toEqual(undefined);
    expect(result.trendNumber).toEqual(undefined);
    expect(result.trendType).toEqual(undefined);
    expect(result.icon).toEqual(undefined);
    expect(result.type).toEqual(ChartType.Velocity);
  });

  it('should only return type given the last two value is zero in the data list', () => {
    const dataList = [0, 0, 0, 0];
    const result = calculateTrendInfo(dataList, dateRangeList, ChartType.Velocity);

    expect(result.dateRangeList).toEqual(undefined);
    expect(result.trendNumber).toEqual(undefined);
    expect(result.trendType).toEqual(undefined);
    expect(result.icon).toEqual(undefined);
    expect(result.type).toEqual(ChartType.Velocity);
  });

  it.each(UP_TREND_IS_BETTER)(
    'should get better result given the type is the up trend is better and the data is up',
    (type) => {
      const dataList = [0, 0, 1, 3];

      const result = calculateTrendInfo(dataList, dateRangeList, type);

      expect(result.dateRangeList).toEqual(['2024/01/24-2024/01/25', '2024/01/22-2024/01/23']);
      expect(result.trendNumber).toEqual(2);
      expect(result.trendType).toEqual(TrendType.Better);
      expect(result.icon).toEqual(TrendIcon.Up);
      expect(result.type).toEqual(type);
    },
  );

  it.each(UP_TREND_IS_BETTER)(
    'should get worse result given the type is the up trend is better and the data is down',
    (type) => {
      const dataList = [0, 0, 3, 1];

      const result = calculateTrendInfo(dataList, dateRangeList, type);

      expect(result.dateRangeList).toEqual(['2024/01/24-2024/01/25', '2024/01/22-2024/01/23']);
      expect(Number(result.trendNumber?.toFixed(2))).toEqual(-0.67);
      expect(result.trendType).toEqual(TrendType.Worse);
      expect(result.icon).toEqual(TrendIcon.Down);
      expect(result.type).toEqual(type);
    },
  );

  it.each(DOWN_TREND_IS_BETTER)(
    'should get better result given the type is the down trend is better and the data is down',
    (type) => {
      const dataList = [0, 0, 3, 1];

      const result = calculateTrendInfo(dataList, dateRangeList, type);

      expect(result.dateRangeList).toEqual(['2024/01/24-2024/01/25', '2024/01/22-2024/01/23']);
      expect(Number(result.trendNumber?.toFixed(2))).toEqual(-0.67);
      expect(result.trendType).toEqual(TrendType.Better);
      expect(result.icon).toEqual(TrendIcon.Down);
      expect(result.type).toEqual(type);
    },
  );

  it.each(DOWN_TREND_IS_BETTER)(
    'should get worse result given the type is the down trend is better and the data is up',
    (type) => {
      const dataList = [0, 0, 1, 3];

      const result = calculateTrendInfo(dataList, dateRangeList, type);

      expect(result.dateRangeList).toEqual(['2024/01/24-2024/01/25', '2024/01/22-2024/01/23']);
      expect(result.trendNumber).toEqual(2);
      expect(result.trendType).toEqual(TrendType.Worse);
      expect(result.icon).toEqual(TrendIcon.Up);
      expect(result.type).toEqual(type);
    },
  );
});

describe('percentageFormatter function', () => {
  it('should return the correct data format with percentage symbol', () => {
    const inputData = 66.66;

    const result = percentageFormatter()(inputData);

    expect(result).toEqual('66.66%');
  });

  it('should return the correct data format without percentage symbol', () => {
    const inputData = 66.66;

    const result = percentageFormatter(false)(inputData);

    expect(result).toEqual('66.66');
  });
});

describe('valueFormatter function', () => {
  it('should return the percent data format with number', () => {
    const inputData: number = 66.66;

    const result: string = valueFormatter(inputData);

    expect(result).toEqual('66.66%');
  });

  it('should return symbol when data is NaN', () => {
    const result: string = valueFormatter(NaN);

    expect(result).toEqual('-');
  });
});

describe('get device size', () => {
  const originScreenWidth = screen.width;

  afterEach(() => {
    jest.spyOn(window, 'screen', 'get').mockReturnValue({ ...screen, width: originScreenWidth });
  });

  it('should return md size when screen width is less than md', async () => {
    jest.spyOn(window, 'screen', 'get').mockReturnValue({ ...screen, width: 1 });

    const size = getDeviceSize();
    expect(size).toEqual('md');
  });

  it('should return lg size when screen width is more than md', async () => {
    jest.spyOn(window, 'screen', 'get').mockReturnValue({ ...screen, width: 1024 });

    const size = getDeviceSize();
    expect(size).toEqual('lg');
  });
});
