import { PIPELINE_TOOL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { useDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { initPipelineSettings } from '@src/context/Metrics/metricsSlice';
import { updateShouldGetPipelineConfig } from '@src/context/Metrics/metricsSlice';
import { pipelineToolClient } from '@src/clients/pipeline/PipelineToolClient';
import { TPipelineToolFieldKeys } from '@src/containers/ConfigStep/Form/type';
import { IPipelineVerifyRequestDTO } from '@src/clients/pipeline/dto/request';
import { IPipelineToolData } from '@src/containers/ConfigStep/Form/schema';
import { updatePipelineTool } from '@src/context/config/configSlice';
import { AxiosRequestErrorCode } from '@src/constants/resources';
import { useFormContext } from 'react-hook-form';
import { useAppDispatch } from '@src/hooks';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export enum FieldKey {
  Type = 0,
  Token = 1,
}
interface IField {
  key: TPipelineToolFieldKeys;
  label: string;
}

export const useVerifyPipelineToolEffect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { pipelineToolOriginal } = useDefaultValues();
  const fields: IField[] = [
    { key: 'type', label: 'Pipeline Tool' },
    { key: 'token', label: 'Token' },
  ];
  const { reset, setError, getValues } = useFormContext();
  const persistReduxData = (pipelineToolConfig: IPipelineToolData) => {
    dispatch(updatePipelineTool(pipelineToolConfig));
    dispatch(updateShouldGetPipelineConfig(true));
    dispatch(initPipelineSettings());
  };

  const resetFields = () => {
    reset(pipelineToolOriginal);
    persistReduxData(pipelineToolOriginal);
  };

  const verifyPipelineTool = async (): Promise<void> => {
    setIsLoading(true);
    const values = getValues() as IPipelineVerifyRequestDTO;
    const response = await pipelineToolClient.verify(values);
    if (response.code === HttpStatusCode.NoContent) {
      reset(pipelineToolOriginal, { keepValues: true });
      persistReduxData(values);
    } else if (response.code === AxiosRequestErrorCode.Timeout) {
      setError(fields[FieldKey.Token].key, { message: PIPELINE_TOOL_ERROR_MESSAGE.token.timeout });
    } else if (response.code === HttpStatusCode.Unauthorized) {
      setError(fields[FieldKey.Token].key, { message: PIPELINE_TOOL_ERROR_MESSAGE.token.unauthorized });
    } else if (response.code === HttpStatusCode.Forbidden) {
      setError(fields[FieldKey.Token].key, { message: PIPELINE_TOOL_ERROR_MESSAGE.token.forbidden });
    } else {
      setError(fields[FieldKey.Token].key, { message: response.errorTitle });
    }
    setIsLoading(false);
  };

  return {
    fields,
    verifyPipelineTool,
    isLoading,
    resetFields,
  };
};
