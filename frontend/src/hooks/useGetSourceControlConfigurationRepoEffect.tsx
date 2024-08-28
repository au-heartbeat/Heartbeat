import {
  selectShouldGetPipelineConfig,
  selectShouldGetSourceControlConfig,
  selectSourceControlConfigurationSettings,
  updateSourceControlConfigurationSettingsWhenCreate,
} from '@src/context/Metrics/metricsSlice';
import {
  selectIsProjectCreated,
  selectSourceControl,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import { ISourceControlGetOrganizationResponseDTO } from '@src/clients/sourceControl/dto/response';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import {MESSAGE, SourceControlTypes} from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';
import {DURATION} from "@src/constants/commons";

export interface IUseGetSourceControlConfigurationStateInterface {
  readonly isLoading: boolean;
  readonly getSourceControlRepoInfo: (value: string) => void;
  readonly info: ISourceControlGetOrganizationResponseDTO;
  readonly errorMessage: string;
}
export const useGetSourceControlConfigurationRepoEffect = (): IUseGetSourceControlConfigurationStateInterface => {
  const defaultInfoStructure = {
    code: 200,
    errorTitle: '',
    errorMessage: '',
  };
  const dispatch = useAppDispatch();
  const [info, setInfo] = useState<ISourceControlGetOrganizationResponseDTO>(defaultInfoStructure);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);

  function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
    return Object.entries(SourceControlTypes)
      .filter((it) => it[0] === enumValue)
      .map((it) => it[1])[0];
  }

  const getSourceControlRepoInfo = async (organization: string) => {
    const params = {
      type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
      token: restoredSourceControlInfo.token,
      organization: organization,
    };
    setIsLoading(true);
    try {
      const response = await sourceControlClient.getRepo(params);
      setInfo(response);
      if (response.code === HttpStatusCode.Ok) {
        dispatch(
          updateSourceControlVerifiedResponse({
            parents: [
              {
                name: 'organization',
                value: organization,
              },
            ],
            names: response.data?.name.map((it) => it),
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setErrorMessageAndTime = (pipelineType: string, errReason?: string) => {
    setErrorMessage(`${MESSAGE.GET_STEPS_FAILED} ${pipelineType} steps${errReason ? ': ' + errReason : ''}`);
    setTimeout(() => {
      setErrorMessage('');
    }, DURATION.ERROR_MESSAGE_TIME);
  };

  return {
    isLoading,
    getSourceControlRepoInfo,
    info,
    errorMessage,
  };
};
