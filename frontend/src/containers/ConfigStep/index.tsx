import {
  basicInfoSchema,
  boardConfigSchema,
  pipelineToolSchema,
  sourceControlSchema,
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';
import { useDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { closeAllNotifications } from '@src/context/notification/NotificationSlice';
import { SourceControl } from '@src/containers/ConfigStep/SourceControl';
import { PipelineTool } from '@src/containers/ConfigStep/PipelineTool';
import { selectConfig } from '@src/context/config/configSlice';
import BasicInfo from '@src/containers/ConfigStep/BasicInfo';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { Board } from '@src/containers/ConfigStep/Board';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ConfigStepWrapper } from './style';
import { useLayoutEffect } from 'react';

const ConfigStep = () => {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(closeAllNotifications());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const configData = useAppSelector(selectConfig);
  const { isShow: isShowBoard } = configData.board;
  const { isShow: isShowPipeline } = configData.pipelineTool;
  const { isShow: isShowSourceControl } = configData.sourceControl;
  const defaultValues = useDefaultValues();

  const basicInfoMethods = useForm<IBasicInfoData>({
    defaultValues: defaultValues.basicInfoWithImport,
    resolver: yupResolver(basicInfoSchema),
    mode: 'onChange',
  });

  const boardConfigMethods = useForm<IBoardConfigData>({
    defaultValues: defaultValues.boardConfigWithImport,
    resolver: yupResolver(boardConfigSchema),
    mode: 'onChange',
  });

  const pipelineToolMethods = useForm<IPipelineToolData>({
    defaultValues: defaultValues.pipelineToolWithImport,
    resolver: yupResolver(pipelineToolSchema),
    mode: 'onChange',
  });

  const sourceControlMethods = useForm<ISourceControlData>({
    defaultValues: defaultValues.sourceControlWithImport,
    resolver: yupResolver(sourceControlSchema),
    mode: 'onChange',
  });
  // console.log('basicInfoMethods.formState.errors', basicInfoMethods.formState.errors);
  // console.log('boardConfigMethods.formState.errors', boardConfigMethods.formState.errors);
  // console.log('pipelineToolMethods.formState.errors', pipelineToolMethods.formState.errors);
  // console.log('sourceControlMethods.formState.errors', sourceControlMethods.formState.errors);

  const isAllFormVerified =
    Object.entries(basicInfoMethods.formState.errors).length === 0 &&
    Object.entries(boardConfigMethods.formState.errors).length === 0 &&
    Object.entries(pipelineToolMethods.formState.errors).length === 0 &&
    Object.entries(sourceControlMethods.formState.errors).length === 0;

  // console.log('isAllFormVerified', isAllFormVerified);
  return (
    <ConfigStepWrapper>
      <FormProvider {...basicInfoMethods}>
        <BasicInfo />
      </FormProvider>
      {isShowBoard && (
        <FormProvider {...boardConfigMethods}>
          <Board />
        </FormProvider>
      )}
      {isShowPipeline && (
        <FormProvider {...pipelineToolMethods}>
          <PipelineTool />
        </FormProvider>
      )}
      {isShowSourceControl && (
        <FormProvider {...sourceControlMethods}>
          <SourceControl />
        </FormProvider>
      )}
    </ConfigStepWrapper>
  );
};

export default ConfigStep;
