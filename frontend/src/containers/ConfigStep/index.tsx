import {
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';
import { closeAllNotifications } from '@src/context/notification/NotificationSlice';
import { ResetConfirmDialog } from '@src/containers/ConfigStep/ResetConfirmDialog';
import { useAppSelector, useAppDispatch } from '@src/hooks/useAppDispatch';
import { SourceControl } from '@src/containers/ConfigStep/SourceControl';
import { PipelineTool } from '@src/containers/ConfigStep/PipelineTool';
import { selectConfig } from '@src/context/config/configSlice';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import BasicInfo from '@src/containers/ConfigStep/BasicInfo';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Board } from '@src/containers/ConfigStep/Board';
import { ConfigStepWrapper } from './style';

interface IConfigStepProps {
  basicInfoMethods: UseFormReturn<IBasicInfoData>;
  boardConfigMethods: UseFormReturn<IBoardConfigData>;
  pipelineToolMethods: UseFormReturn<IPipelineToolData>;
  sourceControlMethods: UseFormReturn<ISourceControlData>;
}

const ConfigStep = ({
  basicInfoMethods,
  boardConfigMethods,
  pipelineToolMethods,
  sourceControlMethods,
}: IConfigStepProps) => {
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(closeAllNotifications());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const configData = useAppSelector(selectConfig);
  const { isShow: isShowBoard } = configData.board;
  const { isShow: isShowPipeline } = configData.pipelineTool;
  const { isShow: isShowSourceControl } = configData.sourceControl;

  useEffect(() => {
    basicInfoMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isShowResetConfirmDialog, setIsShowResetConfirmDialog] = useState<boolean>(false);
  const [resetFields, setResetFields] = useState<() => void>(() => {});
  const onReset = () => {
    setIsShowResetConfirmDialog(true);
  };
  const onResetCancel = () => {
    setIsShowResetConfirmDialog(false);
  };
  const onResetConfirm = () => {
    resetFields();
    setIsShowResetConfirmDialog(false);
  };
  const onSetResetFields = (resetFunc: () => void) => {
    setResetFields(() => {
      return resetFunc;
    });
  };

  return (
    <ConfigStepWrapper>
      <FormProvider {...basicInfoMethods}>
        <BasicInfo />
      </FormProvider>
      {isShowBoard && (
        <FormProvider {...boardConfigMethods}>
          <Board onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      )}
      {isShowPipeline && (
        <FormProvider {...pipelineToolMethods}>
          <PipelineTool onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      )}
      {isShowSourceControl && (
        <FormProvider {...sourceControlMethods}>
          <SourceControl onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      )}
      <ResetConfirmDialog isShowDialog={isShowResetConfirmDialog} onConfirm={onResetConfirm} onClose={onResetCancel} />
    </ConfigStepWrapper>
  );
};

export default ConfigStep;
