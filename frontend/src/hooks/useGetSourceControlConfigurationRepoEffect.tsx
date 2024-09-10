import {
  selectShouldGetSourceControlConfig,
  updateSourceControlConfigurationSettingsFirstInto,
} from '@src/context/Metrics/metricsSlice';
import { DateRange, selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { ISourceControlGetRepoResponseDTO } from '@src/clients/sourceControl/dto/response';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { FULFILLED, REJECTED, SourceControlTypes } from '@src/constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

export interface IUseGetSourceControlConfigurationRepoInterface {
  readonly isLoading: boolean;
  readonly getSourceControlRepoInfo: (value: string, dateRanges: DateRange[], id: number) => Promise<void>;
  readonly isGetRepo: boolean;
  readonly info: ISourceControlGetRepoResponseDTO;
  readonly stepFailedStatus: MetricsDataFailStatus;
}

export const useGetSourceControlConfigurationRepoEffect = (): IUseGetSourceControlConfigurationRepoInterface => {
  const defaultInfoStructure = {
    code: 200,
    errorTitle: '',
    errorMessage: '',
  };

  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
  const [isGetRepo, setIsGetRepo] = useState<boolean>(!shouldGetSourceControlConfig);
  const [info, setInfo] = useState<ISourceControlGetRepoResponseDTO>(defaultInfoStructure);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);
  const [stepFailedStatus, setStepFailedStatus] = useState(MetricsDataFailStatus.NotFailed);

  function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
    return Object.entries(SourceControlTypes)
      .filter((it) => it[0] === enumValue)
      .map((it) => it[1])[0];
  }

  const getSourceControlRepoInfo = async (organization: string, dateRanges: DateRange[], id: number) => {
    setIsLoading(true);
    const allRepoRes = await Promise.allSettled(
      dateRanges.flatMap((dateRange) => {
        const params = {
          type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
          token: restoredSourceControlInfo.token,
          organization: organization,
          endTime: dayjs(dateRange.endDate).startOf('date').valueOf(),
        };
        return sourceControlClient.getRepo(params);
      }),
    );

    const hasRejected = allRepoRes.some((repoInfo) => repoInfo.status === REJECTED);
    const hasFulfilled = allRepoRes.some((repoInfo) => repoInfo.status === FULFILLED);

    if (!hasRejected) {
      setStepFailedStatus(MetricsDataFailStatus.NotFailed);
    } else if (hasRejected && hasFulfilled) {
      const rejectedStep = allRepoRes.find((repoInfo) => repoInfo.status === REJECTED);
      if ((rejectedStep as PromiseRejectedResult).reason.code == 400) {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailedTimeout);
      }
    }

    allRepoRes.forEach((response) => {
      if (response.status === FULFILLED) {
        if (response.value.code !== HttpStatusCode.Ok) {
          setInfo(response.value);
        } else {
          dispatch(
            updateSourceControlVerifiedResponse({
              parents: [
                {
                  name: 'organization',
                  value: organization,
                },
              ],
              names: response.value.data?.name.map((it) => it),
            }),
          );
          dispatch(
            updateSourceControlConfigurationSettingsFirstInto({
              ...response.value.data,
              id,
              type: 'repo',
            }),
          );
        }
      }
    });
    setIsLoading(false);
    setIsGetRepo(true);
  };

  return {
    isLoading,
    getSourceControlRepoInfo,
    isGetRepo,
    info,
    stepFailedStatus,
  };
};
