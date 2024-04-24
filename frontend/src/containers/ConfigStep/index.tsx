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
import { useAppSelector, useAppDispatch } from '@src/hooks/useAppDispatch';
import { SourceControl } from '@src/containers/ConfigStep/SourceControl';
import { PipelineTool } from '@src/containers/ConfigStep/PipelineTool';
import { selectConfig } from '@src/context/config/configSlice';
import BasicInfo from '@src/containers/ConfigStep/BasicInfo';
import { useEffect, useLayoutEffect, useMemo } from 'react';
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

  useEffect(() => {
    basicInfoMethods.trigger();
  }, []);

  const { isValid: isBasicInfoValid, errors } = basicInfoMethods.formState;
  // console.log('isBasicInfoValid', isBasicInfoValid);
  // console.log('basic info values', basicInfoMethods.getValues());
  // console.log('errors', errors);

  const { isValid: isBoardConfigValid, isSubmitSuccessful: isBoardConfigSubmitSuccessful } =
    boardConfigMethods.formState;
  const { isValid: isPipelineToolValid, isSubmitSuccessful: isPipelineToolSubmitSuccessful } =
    pipelineToolMethods.formState;
  const { isValid: isSourceControlValid, isSubmitSuccessful: isSourceControlSubmitSuccessful } =
    sourceControlMethods.formState;

  const formMeta = useMemo(
    () => [
      { isShow: isShowBoard, isValid: isBoardConfigValid, isSubmitSuccessful: isBoardConfigSubmitSuccessful },
      { isShow: isShowPipeline, isValid: isPipelineToolValid, isSubmitSuccessful: isPipelineToolSubmitSuccessful },
      {
        isShow: isShowSourceControl,
        isValid: isSourceControlValid,
        isSubmitSuccessful: isSourceControlSubmitSuccessful,
      },
    ],
    [
      isShowBoard,
      isBoardConfigValid,
      isBoardConfigSubmitSuccessful,
      isShowPipeline,
      isPipelineToolValid,
      isPipelineToolSubmitSuccessful,
      isShowSourceControl,
      isSourceControlValid,
      isSourceControlSubmitSuccessful,
    ],
  );
  // console.log('formMeta', formMeta);
  const activeFormMeta = useMemo(() => formMeta.filter(({ isShow }) => isShow), [formMeta]);
  const shownFormsVerified = useMemo(
    () =>
      activeFormMeta.length > 0 &&
      activeFormMeta.every(({ isValid, isSubmitSuccessful }) => isValid && isSubmitSuccessful),
    [formMeta],
  );

  // console.log('isBasicInfoValid', isBasicInfoValid);
  // console.log('shownFormsVerified', shownFormsVerified);

  useEffect(() => {
    const isConfigPageValid = isBasicInfoValid && shownFormsVerified;
    setIsDisableNextButton(!isConfigPageValid);
  }, [isBasicInfoValid, shownFormsVerified]);

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
