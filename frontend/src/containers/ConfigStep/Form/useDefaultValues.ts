import {
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';
import { selectProjectName } from '@src/context/config/configSlice';
import { useAppSelector } from '@src/hooks/useAppDispatch';

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

export const useDefaultValues = () => {
  const projectName = useAppSelector(selectProjectName);

  const basicInfoWithImport: IBasicInfoData = {
    ...basicInfoDefaultValues,
    projectName,
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
