import {
  selectShouldGetSourceControlConfig,
  updateSourceControlConfigurationSettingsFirstInto,
} from '@src/context/Metrics/metricsSlice';
import { selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { SourceControlTypes } from '@src/constants/resources';
import { useState } from 'react';

export interface IUseGetSourceControlConfigurationBranchInterface {
  readonly isLoading: boolean;
  readonly getSourceControlBranchInfo: (organization: string, repo: string, id: number) => Promise<void>;
  readonly isGetBranch: boolean;
  readonly stepFailedStatus: MetricsDataFailStatus;
}
export const useGetSourceControlConfigurationBranchEffect = (): IUseGetSourceControlConfigurationBranchInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
  const [isGetBranch, setIsGetBranch] = useState<boolean>(!shouldGetSourceControlConfig);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);
  const [stepFailedStatus, setStepFailedStatus] = useState(MetricsDataFailStatus.NotFailed);

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
      sourceControlClient.getBranch(params).then((response) => {
        if (response.code === 400) {
          setStepFailedStatus(MetricsDataFailStatus.AllFailed4xx);
        } else if (response.code === 200) {
          setIsGetBranch(true);
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
              ...response,
              id,
              type: 'branches',
            }),
          );
        } else {
          setStepFailedStatus(MetricsDataFailStatus.AllFailedTimeout);
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getSourceControlBranchInfo,
    isGetBranch,
    stepFailedStatus,
  };
};
