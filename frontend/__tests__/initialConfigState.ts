import { SortType } from '@src/containers/ConfigStep/DateRangePicker/types';
import { Calendar, SourceControlTypes } from '@src/constants/resources';
import { BasicConfigState } from '@src/context/config/configSlice';
import { BOARD_TYPES, PIPELINE_TOOL_TYPES } from './fixtures';

const initialConfigState: BasicConfigState = {
  isProjectCreated: true,
  basic: {
    projectName: '',
    calendarType: Calendar.Regular,
    dateRange: [
      {
        startDate: null,
        endDate: null,
      },
    ],
    sortType: SortType.DEFAULT,
    metrics: [],
  },
  board: {
    config: {
      type: BOARD_TYPES.JIRA,
      boardId: '',
      email: '',
      projectKey: '',
      site: '',
      token: '',
    },
    isShow: false,
    verifiedResponse: {
      jiraColumns: [],
      targetFields: [],
      users: [],
    },
  },
  pipelineTool: {
    config: {
      type: PIPELINE_TOOL_TYPES.BUILD_KITE,
      token: '',
    },
    isShow: false,
    verifiedResponse: {
      pipelineList: [],
    },
  },
  sourceControl: {
    config: {
      type: SourceControlTypes.GitHub,
      token: '',
    },
    isShow: false,
    verifiedResponse: {
      repoList: {
        children: [],
        name: 'root',
        value: '-1',
      },
    },
  },
  warningMessage: null,
};

export default initialConfigState;
