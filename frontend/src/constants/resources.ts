import { ReportResponse } from '@src/clients/report/dto/response';
import { AxiosError } from 'axios';

export enum Calendar {
  Regular = 'REGULAR',
  China = 'CN',
  Vietnam = 'VN',
}

export const CALENDAR_LABEL = {
  [Calendar.Regular]: 'Regular calendar',
  [Calendar.China]: 'Calendar with Chinese holiday',
  [Calendar.Vietnam]: 'Calendar with Vietnam holiday',
};

export const OLD_REGULAR_CALENDAR_LABEL = 'Regular Calendar(Weekend Considered)';

export const CALENDAR_LIST = [Calendar.Regular, Calendar.China, Calendar.Vietnam];

export const REPORT_PAGE_TYPE = {
  SUMMARY: 'Summary',
  BOARD: 'BoardReport',
  DORA: 'DoraReport',
  BOARD_CHART: 'BoardChart',
  DORA_CHART: 'DoraChart',
};

export const REJECTED = 'rejected';
export const FULFILLED = 'fulfilled';

export const SHOW_MORE = 'show more >';
export const BACK = 'Back';
export const RETRY = 'Retry';
export const DATA_LOADING_FAILED = 'Data loading failed';
export const DEFAULT_MESSAGE = '';

export const CHART_TAB_STYLE = {
  sx: {
    bottom: 5,
    height: '0.25rem',
  },
};

export const NOTIFICATION_TITLE = {
  HELP_INFORMATION: 'Help Information',
  PLEASE_NOTE_THAT: 'Please note that',
  SUCCESSFULLY_COMPLETED: 'Successfully completed!',
  SOMETHING_WENT_WRONG: 'Something went wrong!',
};

export const BOARD_METRICS_MAPPING: Record<string, string> = {
  'Cycle time': 'cycleTime',
  Velocity: 'velocity',
  Classification: 'classificationList',
  'Rework times': 'rework',
};

export const DORA_METRICS_MAPPING: Record<string, string> = {
  'Lead time for changes': 'leadTimeForChanges',
  'Deployment frequency': 'deploymentFrequency',
  'Dev change failure rate': 'devChangeFailureRate',
  'Dev mean time to recovery': 'devMeanTimeToRecovery',
};

export enum RequiredData {
  Velocity = 'Velocity',
  CycleTime = 'Cycle time',
  Classification = 'Classification',
  ReworkTimes = 'Rework times',
  LeadTimeForChanges = 'Lead time for changes',
  DeploymentFrequency = 'Deployment frequency',
  PipelineChangeFailureRate = 'Pipeline change failure rate',
  PipelineMeanTimeToRecovery = 'Pipeline mean time to recovery',
}

export const IMPORT_METRICS_MAPPING: Record<string, string> = {
  Velocity: 'Velocity',
  'Cycle time': 'Cycle time',
  Classification: 'Classification',
  'Rework times': 'Rework times',
  'Lead time for changes': 'Lead time for changes',
  'Deployment frequency': 'Deployment frequency',
  'Pipeline change failure rate': 'Pipeline change failure rate',
  'Pipeline mean time to recovery': 'Pipeline mean time to recovery',
  'Change failure rate': 'Pipeline change failure rate',
  'Mean time to recovery': 'Pipeline mean time to recovery',
};

export enum MetricsTitle {
  Velocity = 'Velocity',
  CycleTime = 'Cycle Time',
  Classification = 'Classification',
  Rework = 'Rework',
  LeadTimeForChanges = 'Lead Time For Changes',
  DeploymentFrequency = 'Deployment Frequency',
  PipelineChangeFailureRate = 'Pipeline Change Failure Rate',
  PipelineMeanTimeToRecovery = 'Pipeline Mean Time To Recovery',
}

export enum ChartType {
  Velocity = 'Velocity',
  CycleTime = 'Cycle Time',
  CycleTimeAllocation = 'Cycle Time Allocation',
  Rework = 'Rework',
  Classification = 'Classification',
  LeadTimeForChanges = 'Lead Time For Changes',
  DeploymentFrequency = 'Deployment Frequency',
  PipelineChangeFailureRate = 'Pipeline Change Failure Rate',
  PipelineMeanTimeToRecovery = 'Pipeline Mean Time To Recovery',
}

export enum TrendIcon {
  Up = 'UP',
  Down = 'DOWN',
}

export enum TrendType {
  Better = 'BETTER',
  Worse = 'WORSE',
}

export const CHART_TREND_TIP = {
  [ChartType.Velocity]: 'Velocity(Story point)',
  [ChartType.CycleTime]: 'Days/Story point',
  [ChartType.CycleTimeAllocation]: 'Total development time/Total cycle time',
  [ChartType.Rework]: 'Total rework times',
  [ChartType.LeadTimeForChanges]: 'Lead Time',
  [ChartType.DeploymentFrequency]: 'Deployment Frequency',
  [ChartType.PipelineChangeFailureRate]: 'Pipeline Change Failure Rate',
  [ChartType.PipelineMeanTimeToRecovery]: 'Pipeline Mean Time To Recovery',
  [ChartType.Classification]: 'Classification',
};

export const UP_TREND_IS_BETTER: ChartType[] = [
  ChartType.Velocity,
  ChartType.CycleTimeAllocation,
  ChartType.DeploymentFrequency,
];
export const DOWN_TREND_IS_BETTER: ChartType[] = [
  ChartType.Rework,
  ChartType.CycleTime,
  ChartType.LeadTimeForChanges,
  ChartType.PipelineMeanTimeToRecovery,
  ChartType.PipelineChangeFailureRate,
];

export enum MetricsSubtitle {
  PRLeadTime = 'PR Lead Time(Hours)',
  PipelineLeadTime = 'Pipeline Lead Time(Hours)',
  TotalDelayTime = 'Total Lead Time(Hours)',
  DeploymentFrequency = 'Deployment Frequency(Times/Days)',
  DeploymentTimes = 'Deployment Times(Times)',
  DevMeanTimeToRecoveryHours = '(Hours)',
  FailureRate = '',
  AverageCycleTimePerSP = 'Average Cycle Time(Days/SP)',
  AverageCycleTimePerCard = 'Average Cycle Time(Days/Card)',
  Throughput = 'Throughput(Cards Count)',
  Velocity = 'Velocity(Story Point)',
  TotalReworkTimes = 'Total rework times',
  TotalReworkCards = 'Total rework cards',
  ReworkCardsRatio = 'Rework cards ratio',
}

export const SOURCE_CONTROL_METRICS: string[] = [RequiredData.LeadTimeForChanges];

export const PIPELINE_METRICS: string[] = [
  RequiredData.DeploymentFrequency,
  RequiredData.PipelineChangeFailureRate,
  RequiredData.PipelineMeanTimeToRecovery,
];

export const DORA_METRICS: string[] = [
  RequiredData.LeadTimeForChanges,
  RequiredData.DeploymentFrequency,
  RequiredData.PipelineChangeFailureRate,
  RequiredData.PipelineMeanTimeToRecovery,
];

export const BOARD_METRICS: string[] = [
  RequiredData.Velocity,
  RequiredData.CycleTime,
  RequiredData.Classification,
  RequiredData.ReworkTimes,
];

export enum ConfigTitle {
  Board = 'Board',
  PipelineTool = 'Pipeline Tool',
  SourceControl = 'Source Control',
}

export const BOARD_TYPES = {
  JIRA: 'Jira',
};

export const PIPELINE_TOOL_TYPES = {
  BUILD_KITE: 'BuildKite',
};

export const PIPELINE_TOOL_OTHER_OPTION = 'Other';

export enum SourceControlTypes {
  GitHub = 'GitHub',
}

export enum PipelineSettingTypes {
  DeploymentFrequencySettingType = 'DeploymentFrequencySettings',
  LeadTimeForChangesType = 'LeadTimeForChanges',
}

export const ASSIGNEE_FILTER_TYPES = {
  LAST_ASSIGNEE: 'lastAssignee',
  HISTORICAL_ASSIGNEE: 'historicalAssignee',
};

export const EMAIL = 'Email';

export const BOARD_TOKEN = 'Token';

export const DONE = 'Done';

export const METRICS_CONSTANTS = {
  cycleTimeEmptyStr: '----',
  doneValue: 'Done',
  doneKeyFromBackend: 'done',
  todoValue: 'To do',
  analysisValue: 'Analysis',
  designValue: 'Design',
  inDevValue: 'In Dev',
  blockValue: 'Block',
  waitingForTestingValue: 'Waiting for testing',
  testingValue: 'Testing',
  reviewValue: 'Review',
  waitingForDeploymentValue: 'Waiting for deployment',
};

interface CycleTimeChartOrder {
  name: string;
  order: number;
}

export const CYCLE_TIME_CHARTS_MAPPING: Record<string, CycleTimeChartOrder> = {
  [METRICS_CONSTANTS.inDevValue]: {
    name: 'Development time',
    order: 0,
  },
  [METRICS_CONSTANTS.analysisValue]: {
    name: 'Analysis time',
    order: 1,
  },
  [METRICS_CONSTANTS.designValue]: {
    name: 'Design time',
    order: 2,
  },
  [METRICS_CONSTANTS.blockValue]: {
    name: 'Block time',
    order: 3,
  },
  [METRICS_CONSTANTS.reviewValue]: {
    name: 'Review time',
    order: 4,
  },
  [METRICS_CONSTANTS.waitingForTestingValue]: {
    name: 'Waiting for testing time',
    order: 5,
  },
  [METRICS_CONSTANTS.testingValue]: {
    name: 'Testing time',
    order: 6,
  },
  [METRICS_CONSTANTS.waitingForDeploymentValue]: {
    name: 'Waiting for deployment time',
    order: 7,
  },
};

export const LEAD_TIME_FOR_CHANGES = {
  PR_LEAD_TIME: 'PR Lead Time',
  PIPELINE_LEAD_TIME: 'Pipeline Lead Time',
  TOTAL_LEAD_TIME: 'Total Lead Time',
};

export const LEAD_TIME_CHARTS_MAPPING = {
  [LEAD_TIME_FOR_CHANGES.PR_LEAD_TIME]: 'PR lead time',
  [LEAD_TIME_FOR_CHANGES.PIPELINE_LEAD_TIME]: 'Pipeline lead time',
  [LEAD_TIME_FOR_CHANGES.TOTAL_LEAD_TIME]: 'Total lead time',
};

export const CYCLE_TIME_LIST = [
  METRICS_CONSTANTS.cycleTimeEmptyStr,
  METRICS_CONSTANTS.todoValue,
  METRICS_CONSTANTS.analysisValue,
  METRICS_CONSTANTS.designValue,
  METRICS_CONSTANTS.inDevValue,
  METRICS_CONSTANTS.blockValue,
  METRICS_CONSTANTS.reviewValue,
  METRICS_CONSTANTS.waitingForTestingValue,
  METRICS_CONSTANTS.testingValue,
  METRICS_CONSTANTS.waitingForDeploymentValue,
  METRICS_CONSTANTS.doneValue,
];

export const REWORK_TIME_LIST = [
  METRICS_CONSTANTS.todoValue,
  METRICS_CONSTANTS.analysisValue,
  METRICS_CONSTANTS.inDevValue,
  METRICS_CONSTANTS.blockValue,
  METRICS_CONSTANTS.reviewValue,
  METRICS_CONSTANTS.waitingForTestingValue,
  METRICS_CONSTANTS.testingValue,
];

export const TOKEN_HELPER_TEXT = {
  RequiredTokenText: 'Token is required!',
  InvalidTokenText: 'Token is invalid!',
};

export const TIPS = {
  SAVE_CONFIG:
    'Note: When you save the settings, some tokens might be saved, please save it safely (e.g. by 1 password, vault), Rotate the tokens regularly. (e.g. every 3 months)',
  CYCLE_TIME: 'The report page will sum all the status in the column for cycletime calculation',
  ADVANCE:
    'If the story point and block related values in the board data are 0 due to token permissions or other reasons, please manually enter the corresponding customized field key.Otherwise, please ignore it.',
  TIME_RANGE_PICKER: 'The report page will generate charts to compare metrics data over multiple time ranges',
};

export enum VelocityMetricsName {
  VelocitySP = 'Velocity(Story Point)',
  ThroughputCardsCount = 'Throughput(Cards Count)',
}

export enum CycleTimeMetricsName {
  AVERAGE_CYCLE_TIME = 'Average cycle time',
  ANALYSIS_PROPORTION = 'Total analysis time / Total cycle time',
  DESIGN_PROPORTION = 'Total design time / Total cycle time',
  DEVELOPMENT_PROPORTION = 'Total development time / Total cycle time',
  BLOCK_PROPORTION = 'Total block time / Total cycle time',
  REVIEW_PROPORTION = 'Total review time / Total cycle time',
  WAITING_FOR_TESTING_PROPORTION = 'Total waiting for testing time / Total cycle time',
  TESTING_PROPORTION = 'Total testing time / Total cycle time',
  WAITING_FOR_DEPLOYMENT_PROPORTION = 'Total waiting for deployment time / Total cycle time',
  AVERAGE_ANALYSIS_TIME = 'Average analysis time',
  AVERAGE_DESIGN_TIME = 'Average design time',
  AVERAGE_DEVELOPMENT_TIME = 'Average development time',
  AVERAGE_BLOCK_TIME = 'Average block time',
  AVERAGE_REVIEW_TIME = 'Average review time',
  AVERAGE_WAITING_FOR_TESTING_TIME = 'Average waiting for testing time',
  AVERAGE_TESTING_TIME = 'Average testing time',
  AVERAGE_WAITING_FOR_DEPLOYMENT_TIME = 'Average waiting for deployment time',
}

export const REWORK_TIME_MAPPING = {
  totalReworkTimes: 'Total rework',
  fromAnalysis: 'analysis',
  fromDesign: 'design',
  fromInDev: 'in dev',
  fromBlock: 'block',
  fromReview: 'review',
  fromWaitingForTesting: 'waiting for testing',
  fromTesting: 'testing',
  fromWaitingForDeployment: 'waiting for deployment',
  fromDone: 'done',
  totalReworkCards: 'Total rework cards',
  reworkCardsRatio: 'Rework cards ratio',
};

export const REWORK_BOARD_STATUS: string[] = [
  REWORK_TIME_MAPPING.fromAnalysis,
  REWORK_TIME_MAPPING.fromDesign,
  REWORK_TIME_MAPPING.fromInDev,
  REWORK_TIME_MAPPING.fromBlock,
  REWORK_TIME_MAPPING.fromWaitingForTesting,
  REWORK_TIME_MAPPING.fromTesting,
  REWORK_TIME_MAPPING.fromReview,
  REWORK_TIME_MAPPING.fromWaitingForDeployment,
  REWORK_TIME_MAPPING.fromDone,
];

export const DEPLOYMENT_FREQUENCY_NAME = 'Deployment frequency';

export const DEV_FAILURE_RATE_NAME = 'Dev change failure rate';

export const DEV_MEAN_TIME_TO_RECOVERY_NAME = 'Dev mean time to recovery';

export const PIPELINE_STEP = 'Pipeline/step';

export const REPO_NAME = 'Repo name';

export const SUBTITLE = 'Subtitle';

export const AVERAGE_FIELD = 'Average';

export enum ReportSuffixUnits {
  DaysPerSP = '(Days/SP)',
  DaysPerCard = '(Days/Card)',
  Hours = '(Hours)',
  DeploymentsPerDay = '(Deployments/Day)',
  DeploymentsTimes = '(Deployment times)',
  ClassificationCardCounts = '/Cards count',
  ClassificationStoryPoint = '/Story point',
}

export const MESSAGE = {
  VERIFY_FAILED_ERROR: 'verify failed',
  UNKNOWN_ERROR: 'Unknown',
  GET_STEPS_FAILED: 'Failed to get',
  HOME_VERIFY_IMPORT_WARNING: 'The content of the imported JSON file is empty. Please confirm carefully',
  CONFIG_PAGE_VERIFY_IMPORT_ERROR: 'Imported data is not perfectly matched. Please review carefully before going next!',
  CLASSIFICATION_WARNING: 'Some classifications in import data might be removed.',
  FLAG_CARD_DROPPED_WARNING: 'Please note: ’consider the “Flag” as “Block” ‘ has been dropped!',
  REAL_DONE_WARNING: 'Some selected doneStatus in import data might be removed',
  ORGANIZATION_WARNING: 'This organization in import data might be removed',
  PIPELINE_NAME_WARNING: 'This Pipeline in import data might be removed',
  STEP_WARNING: 'Selected step of this pipeline in import data might be removed',
  NO_STEP_WARNING:
    'There is no step during these periods for this pipeline! Please change the search time in the Config page!',
  ERROR_PAGE: 'Something on internet is not quite right. Perhaps head back to our homepage and try again.',
  EXPIRE_INFORMATION: 'The files will be cleaned up irregularly, please download promptly to avoid expiration.',
  REPORT_LOADING: 'The report is being generated, please do not refresh the page or all the data will be disappeared.',
  LOADING_TIMEOUT: (name: string) => `${name} loading timeout, please click "Retry"!`,
  FAILED_TO_GET_DATA: (name: string) => `Failed to get ${name} data, please click "retry"!`,
  FAILED_TO_GET_CLASSIFICATION_DATA:
    'Failed to get Classification data, please go back to previous page and try again!',
  FAILED_TO_EXPORT_CSV: 'Failed to export csv.',
  FAILED_TO_REQUEST: 'Failed to request!',
  BOARD_INFO_REQUEST_PARTIAL_FAILED_4XX:
    'Failed to get partial Board configuration, please go back to the previous page and check your board info, or click "Next" button to go to Report page.',
  BOARD_INFO_REQUEST_PARTIAL_FAILED_OTHERS:
    'Failed to get partial Board configuration, you can click "Next" button to go to Report page.',
  PIPELINE_STEP_REQUEST_PARTIAL_FAILED_4XX:
    'Failed to get partial Pipeline configuration, please go back to the previous page and change your pipeline token with correct access permission, or click "Next" button to go to Report page.',
  PIPELINE_STEP_REQUEST_PARTIAL_FAILED_OTHERS:
    'Failed to get partial Pipeline configuration, you can click "Next" button to go to Report page.',
  SOURCE_CONTROL_REQUEST_PARTIAL_FAILED_4XX:
    'Failed to get partial Source control configuration, please go back to the previous page and change your source control token with correct access permission, or click "Next" button to go to Report page.',
  SOURCE_CONTROL_REQUEST_PARTIAL_FAILED_OTHERS:
    'Failed to get partial Source control configuration, you can click "Next" button to go to Report page.',
  DORA_CHART_LOADING_FAILED: 'Dora metrics loading timeout, Please click "Retry"!',
  SHARE_REPORT_EXPIRED: 'The report has expired. Please go home page and generate it again.',
};

export const METRICS_CYCLE_SETTING_TABLE_HEADER_BY_COLUMN = [
  {
    text: 'Board Column',
    emphasis: false,
  },
  {
    text: 'Board Status',
    emphasis: false,
  },
  {
    text: 'Heartbeat State',
    emphasis: true,
  },
];

export const METRICS_CYCLE_SETTING_TABLE_HEADER_BY_STATUS = [
  {
    text: 'Board Status',
    emphasis: false,
  },
  {
    text: 'Board Column',
    emphasis: false,
  },
  {
    text: 'Heartbeat State',
    emphasis: true,
  },
];

export const REPORT_PAGE = {
  BOARD: {
    TITLE: 'Board Metrics',
  },
  DORA: {
    TITLE: 'DORA Metrics',
  },
};

export enum CycleTimeSettingsTypes {
  BY_COLUMN = 'byColumn',
  BY_STATUS = 'byStatus',
}

export const AXIOS_NETWORK_ERROR_CODES = [AxiosError.ECONNABORTED, AxiosError.ETIMEDOUT, AxiosError.ERR_NETWORK];

export const NO_PIPELINE_STEP_ERROR = 'No steps for this pipeline!';

export enum AxiosRequestErrorCode {
  Timeout = 'NETWORK_TIMEOUT',
  NoCards = 'NO_CARDS',
}

export const BOARD_CONFIG_INFO_TITLE = {
  FORBIDDEN_REQUEST: 'Forbidden request!',
  INVALID_INPUT: 'Invalid input!',
  UNAUTHORIZED_REQUEST: 'Unauthorized request!',
  NOT_FOUND: 'Not found!',
  NO_CONTENT: 'No card within selected date range!',
  GENERAL_ERROR: 'Failed to get Board configuration!',
  EMPTY: '',
};

export const PIPELINE_CONFIG_TITLE = 'Failed to get Pipeline configuration!';

export const SOURCE_CONTROL_CONFIG_TITLE = 'Failed to get source control configuration!';

export const BOARD_CONFIG_INFO_ERROR = {
  FORBIDDEN: 'Please go back to the previous page and change your board token with correct access permission.',
  NOT_FOUND: 'Please go back to the previous page and check your board info!',
  NOT_CONTENT: 'Please go back to the previous page and change your collection date, or check your board info!',
  GENERAL_ERROR: 'Please go back to the previous page and check your board info!',
  RETRY: 'Data loading failed, please',
};

export const PIPELINE_TOOL_VERIFY_ERROR_CASE_TEXT_MAPPING: { [key: string]: string } = {
  '401': 'Token is incorrect!',
  '403': 'Forbidden request, please change your token with correct access permission.',
};

export const PIPELINE_TOOL_GET_INFO_ERROR_CASE_TEXT_MAPPING: { [key: string]: string } = {
  '204': 'No pipeline!',
  '400': 'Invalid input!',
  '401': 'Unauthorized request!',
  '403': 'Forbidden request!',
  '404': 'Not found!',
};

export const SOURCE_CONTROL_ERROR_CASE_TEXT_MAPPING: { [key: string]: string } = {
  '204': 'No source control info!',
  '400': 'Invalid input!',
  '401': 'Unauthorized request!',
  '403': 'Forbidden request!',
  '404': 'Not found!',
};

export const UNKNOWN_ERROR_TITLE = 'Unknown error';

export const PIPELINE_TOOL_GET_INFO_ERROR_MESSAGE =
  'Please go back to the previous page and change your pipeline token with correct access permission.';

export const SOURCE_CONTROL_ERROR_MESSAGE =
  'Please go back to the previous page and change your source control token with correct access permission.';

export const PIPELINE_TOOL_RETRY_MESSAGE = 'Data loading failed, please';
export const PIPELINE_TOOL_RETRY_TRIGGER_MESSAGE = ' try again';

export const SOURCE_CONTROL_VERIFY_ERROR_CASE_TEXT_MAPPING: Record<string, string> = {
  '401': 'Token is incorrect!',
};

export const SOURCE_CONTROL_GET_INFO_ERROR_CASE_TEXT_MAPPING: Record<string, string> = {
  '401': 'Token is incorrect!',
  '403': 'Unable to read target branch, please check the token or target branch!',
};

export const SOURCE_CONTROL_BRANCH_INVALID_TEXT: Record<string, string> = {
  '400': 'The codebase branch marked in red is invalid!',
  '401': 'Can not read target branch due to unauthorized token!',
  '404': 'The branch has been deleted!',
};

export const ALL_OPTION_META: Record<string, string> = {
  label: 'All',
  key: 'all',
};

export const REWORK_DIALOG_NOTE = {
  REWORK_EXPLANATION:
    'Rework to which state means going back to the selected state from any state after the selected state.',
  REWORK_NOTE:
    'The selectable states in the "rework to which state" drop-down list are the heartbeat states you matched in the board mapping.',
  EXCLUDE_EXPLANATION:
    'Exclude which states means going back to the 1st selected state from any state after the 1st selected state except the selected state.',
  EXCLUDE_NOTE:
    'The selectable states in the "Exclude which states(optional)" drop-down list are all states after the state selected in "rework to which state".',
};

export const REWORK_STEPS = {
  REWORK_TO_WHICH_STATE: 0,
  EXCLUDE_WHICH_STATES: 1,
};

export const REWORK_STEPS_NAME = ['Rework to which state', 'Exclude which states'];

export const DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS = 13;

export const GENERATE_GITHUB_TOKEN_LINK =
  'https://github.com/au-heartbeat/Heartbeat?tab=readme-ov-file#3133-guideline-for-generating-github-token';
export const AUTHORIZE_ORGANIZATION_LINK =
  'https://github.com/au-heartbeat/Heartbeat?tab=readme-ov-file#3134-authorize-github-token-with-correct-organization';

export const DEFAULT_MONTH_INTERVAL_DAYS = 30;
export const DATE_RANGE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
export const TIME_RANGE_TITLE = 'Time range settings';
export const ADD_TIME_RANGE_BUTTON_TEXT = 'New time range';
export const REMOVE_BUTTON_TEXT = 'Remove';
export const MAX_TIME_RANGE_AMOUNT = 6;

export enum SortingDateRangeText {
  DEFAULT = 'Default sort',
  ASCENDING = 'Ascending',
  DESCENDING = 'Descending',
}

export const DISABLED_DATE_RANGE_MESSAGE = 'Report generated failed during this period.';

export const emptyDataMapperDoraChart = (allPipelines: string[], value: string): ReportResponse => {
  const deploymentFrequencyList = allPipelines.map((it, index) => {
    return {
      id: index,
      name: it,
      valueList: [
        {
          value: value,
        },
        {
          value: value,
        },
      ],
    };
  });
  const pipelineMeanTimeToRecoveryList = allPipelines.map((it, index) => {
    return {
      id: index,
      name: it,
      valueList: [
        {
          value: value,
        },
      ],
    };
  });
  const leadTimeForChangesList = allPipelines.map((it, index) => {
    return {
      id: index,
      name: it,
      valueList: [
        {
          name: LEAD_TIME_FOR_CHANGES.PR_LEAD_TIME,
          values: [value],
        },
        {
          name: LEAD_TIME_FOR_CHANGES.PIPELINE_LEAD_TIME,
          values: [value],
        },
        {
          name: LEAD_TIME_FOR_CHANGES.TOTAL_LEAD_TIME,
          values: [value],
        },
      ],
    };
  });
  const pipelineChangeFailureRateList = allPipelines.map((it, index) => {
    return {
      id: index,
      name: it,
      valueList: [
        {
          value: value + '%(0/0)',
        },
      ],
    };
  });
  return {
    deploymentFrequencyList,
    pipelineMeanTimeToRecoveryList,
    leadTimeForChangesList,
    pipelineChangeFailureRateList,
    exportValidityTimeMin: 0.0005,
  };
};

export const DORA_METRICS_EXPLANATION = {
  [RequiredData.LeadTimeForChanges.toLowerCase()]: {
    insight:
      'this value is lower is better, means that your team is more efficient and flexible in responding to changes.',
    definitions: {
      definition:
        'the time from first code commit of PR until the PR deployed to production. In heartbeat, Lead time for changes = PR lead time + Pipleline lead time',
      details: [
        'Definition for ‘PR lead time’ :  is the time from code committed to PR merge.',
        'Definition for ‘Pipeline lead time’ : is the time from PR merge to Job complete.',
      ],
    },
    'influenced factors': {
      details: [
        'Collection date type (exclude weekend & holidays)',
        'Added pipelines',
        'Selected pipeline steps',
        'Selected Github branch for pipeline',
        'Selected pipeline crews',
      ],
    },
  },
  [RequiredData.DeploymentFrequency.toLowerCase()]: {
    insight:
      'this value is higher is better, means that your team is capable of responding to changes, iterating, and updating products in a rapid and efficient manner.',
    definitions: {
      details: [
        "Definition for 'Deployment Frequency': this metrics records how often you deploy code to production on a daily basis.",
        "Definition for 'Deployment Times': how many times you deploy code to production.",
      ],
    },
    'influenced factors': {
      details: [
        'Added pipelines',
        'Selected pipeline steps',
        'Selected Github branch for pipeline',
        'Selected pipeline crews',
        'Passed builds',
      ],
    },
  },
  [RequiredData.PipelineChangeFailureRate.toLowerCase()]: {
    insight:
      'this value is lower is better, means that the failed pipelines are fewer, and your team is able to deploy updates successfully in a more reliable manner.',
    definitions: {
      definition:
        'this metrics is different from the official definition of change failure rate, in heartbeat, we definite this metrics based on pipeline, which is the percentage of failed pipeline builds in the total pipeline builds.',
      details: [],
    },
    'influenced factors': {
      details: [
        'Added pipelines',
        'Selected pipeline steps',
        'Selected Github branch for pipeline',
        'Selected pipeline crews',
      ],
    },
  },
  [RequiredData.PipelineMeanTimeToRecovery.toLowerCase()]: {
    insight:
      'this value is lower is better, means that your team possesses capabilities of efficiency, professionalism, and continuous improvement in fault management and system recovery.',
    definitions: {
      definition:
        'this metrics is also different from the official definition of Mean time to recovery. This metrics comes from pipeline, and it records how long it generally takes to restore a pipeline when pipeline failed.',
      details: [],
    },
    'influenced factors': {
      details: [
        'Collection date type (exclude weekend & holidays)',
        'Added pipelines',
        'Selected pipeline steps',
        'Selected Github branch for pipeline',
        'Selected pipeline crews',
      ],
    },
  },
};
