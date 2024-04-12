export const CALENDAR_TYPE_LITERAL = ['Regular Calendar(Weekend Considered)', 'Calendar with Chinese Holiday'];
export const METRICS_LITERAL = [
  'Velocity',
  'Cycle time',
  'Classification',
  'Rework times',
  'Lead time for changes',
  'Deployment frequency',
  'Dev change failure rate',
  'Dev mean time to recovery',
];
export const BOARD_TYPE_LITERAL = ['Jira'];
export const PIPELINE_TOOL_TYPE_LITERAL = ['BuildKite'];
export const SOURCE_CONTROL_TYPE_LITERAL = ['GitHub'];

export interface IBoardConfigErrorMessage {
  boardId: {
    required: string;
    invalid: string;
  };
  email: {
    required: string;
    invalid: string;
  };
  site: {
    required: string;
  };
  token: {
    required: string;
    invalid: string;
  };
}
export const BASIC_INFO_ERROR_MESSAGE = {
  projectName: 'Project name is required',
};
export const BOARD_CONFIG_ERROR_MESSAGE: IBoardConfigErrorMessage = {
  boardId: {
    required: 'Board Id is required!',
    invalid: 'Board Id is invalid!',
  },
  email: {
    required: 'Email is required!',
    invalid: 'Email is invalid!',
  },
  site: {
    required: 'Site is required!',
  },
  token: {
    required: 'Token is required!',
    invalid: 'Token is invalid!',
  },
};
