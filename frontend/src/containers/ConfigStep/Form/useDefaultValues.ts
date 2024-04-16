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
import { selectBasicInfo, selectBoard, selectPipelineTool } from '@src/context/config/configSlice';
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
  const basicInfo = useAppSelector(selectBasicInfo);
  const boardConfig = useAppSelector(selectBoard);
  const pipelineTool = useAppSelector(selectPipelineTool);

  const basicInfoWithImport: IBasicInfoData = {
    ...basicInfoDefaultValues,
    ...basicInfo,
  };

  const boardConfigWithImport: IBoardConfigData = {
    ...boardConfigDefaultValues,
    type: boardConfig.type,
    boardId: boardConfig.boardId,
    email: boardConfig.email,
    site: boardConfig.site,
    token: boardConfig.token,
  };

  const pipelineToolWithImport: IPipelineToolData = {
    ...pipelineToolDefaultValues,
    ...pipelineTool,
  };

  const sourceControlWithImport: ISourceControlData = {
    ...sourceControlDefaultValues,
  };

  return {
    basicInfoOriginal: basicInfoDefaultValues,
    basicInfoWithImport,
    boardConfigOriginal: boardConfigDefaultValues,
    boardConfigWithImport,
    pipelineToolOriginal: pipelineToolDefaultValues,
    pipelineToolWithImport,
    sourceControlOriginal: sourceControlWithImport,
    sourceControlWithImport,
  };
};
