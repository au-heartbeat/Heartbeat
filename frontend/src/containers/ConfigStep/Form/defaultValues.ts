import {
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';

export const basicInfoDefaultValues: IBasicInfoData = {
  projectName: '',
  dateRange: [],
  calendarType: 'Regular Calendar(Weekend Considered)',
  metrics: [],
};

export const boardConfigDefaultValues: IBoardConfigData = {
  type: 'Jira',
  boardId: '',
  email: '',
  site: '',
  token: '',
};

export const pipelineToolDefaultValues: IPipelineToolData = {
  type: 'BuildKite',
  token: '',
};

export const sourceControlDefaultValues: ISourceControlData = {
  type: 'GitHub',
  token: '',
};
