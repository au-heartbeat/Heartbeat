import { initDeploymentFrequencySettings } from '@src/context/Metrics/metricsSlice';
import { updatePipelineToolVerifyState } from '@src/context/config/configSlice';
import { pipelineToolClient } from '@src/clients/pipeline/PipelineToolClient';
import { IPipelineVerifyRequestDTO } from '@src/clients/pipeline/dto/request';
import { HEARTBEAT_EXCEPTION_CODE } from '@src/constants/resources';
import { useAppDispatch } from '@src/hooks';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export const useVerifyPipelineToolEffect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedError, setVerifiedError] = useState('');
  const dispatch = useAppDispatch();
  const [isHBTimeOut, setIsHBTimeOut] = useState(false);
  const [isShowAlert, setIsShowAlert] = useState(false);
  const verifyPipelineTool = async (params: IPipelineVerifyRequestDTO): Promise<void> => {
    setIsLoading(true);
    const response = await pipelineToolClient.verify(params, setIsHBTimeOut, setIsShowAlert);
    console.log(11, response.code);
    if (response.code === HttpStatusCode.NoContent) {
      dispatch(updatePipelineToolVerifyState(true));
      dispatch(initDeploymentFrequencySettings());
    } else if (response.code === HEARTBEAT_EXCEPTION_CODE.TIMEOUT) {
      setIsHBTimeOut(true);
      setIsShowAlert(true);
    } else {
      setVerifiedError(response.errorTitle);
    }
    setIsLoading(false);
  };

  const clearVerifiedError = () => {
    if (verifiedError) setVerifiedError('');
  };

  return {
    verifyPipelineTool,
    isLoading,
    verifiedError,
    clearVerifiedError,
    isHBTimeOut,
    isShowAlert,
    setIsShowAlert,
  };
};
