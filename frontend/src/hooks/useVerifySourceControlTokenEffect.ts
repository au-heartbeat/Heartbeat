import {
  initDeploymentFrequencySettings,
  updateShouldGetPipelineConfig,
  updateShouldGetSourceControlConfig,
} from '@src/context/Metrics/metricsSlice';
import { SOURCE_CONTROL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { SourceControlVerifyRequestDTO } from '@src/clients/sourceControl/dto/request';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { TSourceControlFieldKeys } from '@src/containers/ConfigStep/Form/type';
import { ISourceControlData } from '@src/containers/ConfigStep/Form/schema';
import { updateSourceControl } from '@src/context/config/configSlice';
import { AxiosRequestErrorCode } from '@src/constants/resources';
import { useAppDispatch } from '@src/hooks/index';
import { useFormContext } from 'react-hook-form';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export enum FieldKey {
  Type = 0,
  Token = 1,
}

interface IField {
  key: TSourceControlFieldKeys;
  label: string;
}

export const useVerifySourceControlTokenEffect = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const fields: IField[] = [
    { key: 'type', label: 'Source Control' },
    { key: 'token', label: 'Token' },
  ];
  const { sourceControlOriginal } = useDefaultValues();
  const { reset, setError, getValues } = useFormContext();
  const persistReduxData = (sourceControlConfig: ISourceControlData) => {
    dispatch(updateSourceControl(sourceControlConfig));
    dispatch(updateShouldGetPipelineConfig(true));
    dispatch(updateShouldGetSourceControlConfig(true));
    dispatch(initDeploymentFrequencySettings());
  };
  const resetFields = () => {
    reset(sourceControlOriginal);
  };

  const verifyToken = async () => {
    setIsLoading(true);
    const values = getValues() as SourceControlVerifyRequestDTO;
    const response = await sourceControlClient.verifyToken(values);
    if (response.code === HttpStatusCode.NoContent) {
      persistReduxData(values);
      reset(sourceControlOriginal, { keepValues: true });
    } else if (response.code === AxiosRequestErrorCode.Timeout) {
      setError(fields[FieldKey.Token].key, { message: SOURCE_CONTROL_ERROR_MESSAGE.token.timeout });
    } else if (response.code === HttpStatusCode.Unauthorized) {
      setError(fields[FieldKey.Token].key, { message: SOURCE_CONTROL_ERROR_MESSAGE.token.unauthorized });
    } else {
      setError(fields[FieldKey.Token].key, { message: response.errorTitle });
    }
    setIsLoading(false);
    return response;
  };

  return {
    verifyToken,
    isLoading,
    fields,
    resetFields,
  };
};
