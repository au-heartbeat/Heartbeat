import {
  selectIsProjectCreated,
  selectSourceControl,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import { updateSourceControlConfigurationSettingsFirstInto } from '@src/context/Metrics/metricsSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { SourceControlTypes } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export interface IUseGetSourceControlConfigurationRepoInterface {
  readonly isLoading: boolean;
  readonly getSourceControlRepoInfo: (value: string) => void;
  readonly isGetRepo: boolean;
}
export const useGetSourceControlConfigurationRepoEffect = (): IUseGetSourceControlConfigurationRepoInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGetRepo, setIsGetRepo] = useState<boolean>(false);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);
  const isProjectCreated = useAppSelector(selectIsProjectCreated);

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
        dispatch(
          updateSourceControlConfigurationSettingsFirstInto({
            ...response.data,
            isProjectCreated,
            type: 'repo',
          }),
        );
      }
    } finally {
      setIsLoading(false);
      setIsGetRepo(true);
    }
  };

  return {
    isLoading,
    getSourceControlRepoInfo,
    isGetRepo,
  };
};
