import {
  selectShouldGetSourceControlConfig,
  updateSourceControlConfigurationSettingsFirstInto,
} from '@src/context/Metrics/metricsSlice';
import {
  DateRangeList,
  selectSourceControl,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { updateMetricsPageLoadingStatus } from '@src/context/stepper/StepperSlice';
import { FULFILLED, REJECTED, SourceControlTypes } from '@src/constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { formatDateToTimestampString } from '@src/utils/util';
import { useState } from 'react';
import dayjs from 'dayjs';

export interface IUseGetSourceControlConfigurationRepoInterface {
  readonly isLoading: boolean;
  readonly getSourceControlRepoInfo: (value: string, dateRanges: DateRangeList, id: number) => Promise<void>;
  readonly isGetRepo: boolean;
  readonly stepFailedStatus: MetricsDataFailStatus;
}

export const useGetSourceControlConfigurationRepoEffect = (): IUseGetSourceControlConfigurationRepoInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
  const [isGetRepo, setIsGetRepo] = useState<boolean>(!shouldGetSourceControlConfig);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);
  const [stepFailedStatus, setStepFailedStatus] = useState(MetricsDataFailStatus.NotFailed);

  function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
    return Object.entries(SourceControlTypes)
      .filter((it) => it[0] === enumValue)
      .map((it) => it[1])[0];
  }

  const getSourceControlRepoInfo = async (organization: string, dateRanges: DateRangeList, id: number) => {
    setIsLoading(true);
    dispatch(
      updateMetricsPageLoadingStatus(
        dateRanges.map((it) => {
          return {
            startDate: formatDateToTimestampString(it.startDate!),
            loadingStatus: {
              sourceControlRepo: {
                isLoading: true,
                isLoaded: false,
                isLoadedWithError: false,
              },
            },
          };
        }),
      ),
    );
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
      const code = (rejectedStep as PromiseRejectedResult).reason.code;
      if (code === 400 || code === 401 || code === 403 || code === 404) {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailedTimeout);
      }
    } else {
      const rejectedStep = allRepoRes.find((repoInfo) => repoInfo.status === REJECTED);
      if ((rejectedStep as PromiseRejectedResult).reason.code == 400) {
        setStepFailedStatus(MetricsDataFailStatus.AllFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.AllFailedTimeout);
      }
    }

    allRepoRes.forEach((response, index) => {
      dispatch(
        updateMetricsPageLoadingStatus([
          {
            startDate: formatDateToTimestampString(dateRanges[index].startDate!),
            loadingStatus: {
              sourceControlRepo: {
                isLoading: false,
                isLoaded: true,
                isLoadedWithError: response.status !== FULFILLED,
              },
            },
          },
        ]),
      );
      if (response.status === FULFILLED) {
        setIsGetRepo(true);
        dispatch(
          updateSourceControlVerifiedResponse({
            parents: [
              {
                name: 'organization',
                value: organization,
              },
            ],
            names: response.value.name.map((it) => it),
          }),
        );
        dispatch(
          updateSourceControlConfigurationSettingsFirstInto({
            ...response.value,
            id,
            type: 'repo',
          }),
        );
      }
    });
    setIsLoading(false);
  };

  return {
    isLoading,
    getSourceControlRepoInfo,
    isGetRepo,
    stepFailedStatus,
  };
};
