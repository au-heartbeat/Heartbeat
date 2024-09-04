import {
  selectShouldGetSourceControlConfig,
  updateSourceControlConfigurationSettingsFirstInto,
} from '@src/context/Metrics/metricsSlice';
import { selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { SourceControlTypes } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export interface IUseGetSourceControlConfigurationBranchInterface {
  readonly isLoading: boolean;
  readonly getSourceControlBranchInfo: (organization: string, repo: string, id: number) => Promise<void>;
  readonly isGetBranch: boolean;
}
export const useGetSourceControlConfigurationBranchEffect = (): IUseGetSourceControlConfigurationBranchInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
  const [isGetBranch, setIsGetBranch] = useState<boolean>(!shouldGetSourceControlConfig);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);

  function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
    return Object.entries(SourceControlTypes)
      .filter((it) => it[0] === enumValue)
      .map((it) => it[1])[0];
  }

  const getSourceControlBranchInfo = async (organization: string, repo: string, id: number) => {
    const params = {
      type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
      token: restoredSourceControlInfo.token,
      organization: organization,
      repo: repo,
    };
    setIsLoading(true);
    try {
      const response = await sourceControlClient.getBranch(params);
      if (response.code === HttpStatusCode.Ok) {
        dispatch(
          updateSourceControlVerifiedResponse({
            parents: [
              {
                name: 'organization',
                value: organization,
              },
              {
                name: 'repo',
                value: repo,
              },
            ],
            names: response.data?.name.map((it) => it),
          }),
        );
        dispatch(
          updateSourceControlConfigurationSettingsFirstInto({
            ...response.data,
            id,
            type: 'branches',
          }),
        );
      }
    } finally {
      setIsLoading(false);
      setIsGetBranch(true);
    }
  };

  return {
    isLoading,
    getSourceControlBranchInfo,
    isGetBranch,
  };
};
