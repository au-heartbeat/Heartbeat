import {
  CALENDAR_TYPE_LITERAL,
  BOARD_TYPE_LITERAL,
  PIPELINE_TOOL_TYPE_LITERAL,
  SOURCE_CONTROL_TYPE_LITERAL,
} from '@src/containers/ConfigStep/Form/literal';
import {
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';
import { selectProjectName, selectCalendarType, selectMetrics } from '@src/context/config/configSlice';
import { useAppSelector } from '@src/hooks/useAppDispatch';

export const basicInfoDefaultValues: IBasicInfoData = {
  projectName: '',
  dateRange: [],
  calendarType: CALENDAR_TYPE_LITERAL[0],
  metrics: [],
};

export const boardConfigDefaultValues: IBoardConfigData = {
  type: BOARD_TYPE_LITERAL[0],
  boardId: '',
  email: '',
  site: '',
  token: '',
};

export const pipelineToolDefaultValues: IPipelineToolData = {
  type: PIPELINE_TOOL_TYPE_LITERAL[0],
  token: '',
};

export const sourceControlDefaultValues: ISourceControlData = {
  type: SOURCE_CONTROL_TYPE_LITERAL[0],
  token: '',
};

export const useDefaultValues = () => {
  const projectName = useAppSelector(selectProjectName);
  const calendarType = useAppSelector(selectCalendarType);
  const metrics = useAppSelector(selectMetrics);

  const basicInfoWithImport: IBasicInfoData = {
    ...basicInfoDefaultValues,
    projectName,
    calendarType,
    metrics: [...metrics],
  };

  const boardConfigWithImport: IBoardConfigData = {
    ...boardConfigDefaultValues,
  };

  const pipelineToolWithImport: IPipelineToolData = {
    ...pipelineToolDefaultValues,
  };

  const sourceControlWithImport: ISourceControlData = {
    ...sourceControlDefaultValues,
  };

  return {
    basicInfo: basicInfoWithImport,
    boardConfig: boardConfigWithImport,
    pipelineTool: pipelineToolWithImport,
    sourceControl: sourceControlWithImport,
  };
};
