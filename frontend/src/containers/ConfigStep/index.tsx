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
import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { Board } from '@src/containers/ConfigStep/Board';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ConfigStepWrapper } from './style';

interface IConfigStepProps {
  setIsDisableNextButton: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfigStep = ({ setIsDisableNextButton }: IConfigStepProps) => {
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

  const { isValid: isBasicInfoValid } = basicInfoMethods.formState;
  const { isValid: isBoardConfigValid, isSubmitSuccessful: isBoardConfigSubmitSuccessful } =
    boardConfigMethods.formState;
  const { isValid: isPipelineToolValid, isSubmitSuccessful: isPipelineToolSubmitSuccessful } =
    pipelineToolMethods.formState;
  const { isValid: isSourceControlValid, isSubmitSuccessful: isSourceControlSubmitSuccessful } =
    sourceControlMethods.formState;
  const isBoardConfigPass = useMemo(
    () => (isShowBoard ? isBoardConfigValid && isBoardConfigSubmitSuccessful : true),
    [isShowBoard, isBoardConfigValid, isBoardConfigSubmitSuccessful],
  );
  const isPipelineToolPass = useMemo(
    () => (isShowPipeline ? isPipelineToolValid && isPipelineToolSubmitSuccessful : true),
    [isShowPipeline, isPipelineToolValid, isPipelineToolSubmitSuccessful],
  );
  const isSourceControlPass = useMemo(
    () => (isShowSourceControl ? isSourceControlValid && isSourceControlSubmitSuccessful : true),
    [isShowSourceControl, isSourceControlValid, isSourceControlSubmitSuccessful],
  );
  console.log('');
  console.log('--- Basic form ---');
  console.log('isBasicInfoValid', isBasicInfoValid);
  console.log('--- Board form ---');
  console.log('isBoardConfigValid', isBoardConfigValid);
  console.log('isBoardConfigSubmitSuccessful', isBoardConfigSubmitSuccessful);
  console.log('isBoardConfigPass', isBoardConfigPass);
  console.log('--- PipelineTool form ---');
  console.log('isPipelineToolValid', isPipelineToolValid);
  console.log('isPipelineToolSubmitSuccessful', isPipelineToolSubmitSuccessful);
  console.log('isPipelineToolPass', isPipelineToolPass);
  console.log('--- SourceControl form ---');
  console.log('isSourceControlValid', isSourceControlValid);
  console.log('isSourceControlSubmitSuccessful', isSourceControlSubmitSuccessful);
  console.log('isSourceControlPass', isSourceControlPass);
  const isAllFormVerified =
    // isBasicInfoValid &&
    useMemo(
      () => isBoardConfigPass && isPipelineToolPass && isSourceControlPass,
      [isBoardConfigPass, isPipelineToolPass, isSourceControlPass],
    );

  console.log('isAllFormVerified', isAllFormVerified);
  useEffect(() => {
    setIsDisableNextButton(!isAllFormVerified);
  }, [isAllFormVerified]);
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
