import { DateRange, selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { selectShouldGetSourceControlConfig } from '@src/context/Metrics/metricsSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { updateMetricsPageLoadingStatus } from '@src/context/stepper/StepperSlice';
import { FULFILLED, REJECTED, SourceControlTypes } from '@src/constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { formatDateToTimestampString } from '@src/utils/util';
import { useState } from 'react';
import dayjs from 'dayjs';

export interface IUseGetSourceControlConfigurationCrewInterface {
  readonly isLoading: boolean;
  readonly isGetAllCrews: boolean;
  readonly getSourceControlCrewInfo: (
    organization: string,
    repo: string,
    branch: string,
    dateRanges: DateRange[],
  ) => Promise<void>;
  readonly stepFailedStatus: MetricsDataFailStatus;
}

export const useGetSourceControlConfigurationCrewEffect = (): IUseGetSourceControlConfigurationCrewInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
  const [isGetAllCrews, setIsGetAllCrews] = useState<boolean>(!shouldGetSourceControlConfig);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);
  const [stepFailedStatus, setStepFailedStatus] = useState(MetricsDataFailStatus.NotFailed);

  function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
    return Object.entries(SourceControlTypes)
      .filter((it) => it[0] === enumValue)
      .map((it) => it[1])[0];
  }

  const getSourceControlCrewInfo = async (
    organization: string,
    repo: string,
    branch: string,
    dateRanges: DateRange[],
  ) => {
    setIsLoading(true);
    dispatch(
      updateMetricsPageLoadingStatus(
        dateRanges.map((it) => {
          return {
            startDate: formatDateToTimestampString(it.startDate!),
            loadingStatus: {
              sourceControlCrew: {
                isLoading: true,
                isLoaded: false,
                isLoadedWithError: false,
              },
            },
          };
        }),
      ),
    );
    const allCrewsRes = await Promise.allSettled(
      dateRanges.flatMap((dateRange) => {
        const params = {
          type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
          token: restoredSourceControlInfo.token,
          organization,
          repo,
          branch,
          startTime: dayjs(dateRange.startDate).startOf('date').valueOf(),
          endTime: dayjs(dateRange.endDate).startOf('date').valueOf(),
        };
        return sourceControlClient.getCrew(params);
      }),
    );

    const hasRejected = allCrewsRes.some((crewInfo) => crewInfo.status === REJECTED);
    const hasFulfilled = allCrewsRes.some((crewInfo) => crewInfo.status === FULFILLED);
    if (!hasRejected) {
      setStepFailedStatus(MetricsDataFailStatus.NotFailed);
    } else if (hasRejected && hasFulfilled) {
      const rejectedStep = allCrewsRes.find((crewInfo) => crewInfo.status === REJECTED);
      if ((rejectedStep as PromiseRejectedResult).reason.code == 400) {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailedTimeout);
      }
    } else {
      const rejectedStep = allCrewsRes.find((crewInfo) => crewInfo.status === REJECTED);
      if ((rejectedStep as PromiseRejectedResult).reason.code == 400) {
        setStepFailedStatus(MetricsDataFailStatus.AllFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.AllFailedTimeout);
      }
    }

    allCrewsRes.forEach((response, index) => {
      dispatch(
        updateMetricsPageLoadingStatus([
          {
            startDate: formatDateToTimestampString(dateRanges[index].startDate!),
            loadingStatus: {
              sourceControlCrew: {
                isLoading: false,
                isLoaded: true,
                isLoadedWithError: response.status !== FULFILLED,
              },
            },
          },
        ]),
      );
      if (response.status === FULFILLED) {
        setIsGetAllCrews(true);
        const startTime = dayjs(dateRanges[index].startDate).startOf('date').valueOf();
        const endTime = dayjs(dateRanges[index].endDate).startOf('date').valueOf();
        const parents = [
          {
            name: 'organization',
            value: organization,
          },
          {
            name: 'repo',
            value: repo,
          },
          {
            name: 'branch',
            value: branch,
          },
        ];
        const savedTime = `${startTime}-${endTime}`;
        dispatch(
          updateSourceControlVerifiedResponse({
            parents: parents,
            names: [savedTime],
          }),
        );
        dispatch(
          updateSourceControlVerifiedResponse({
            parents: [
              ...parents,
              {
                name: 'time',
                value: savedTime,
              },
            ],
            names: response.value.crews.map((it) => it),
          }),
        );
      }
    });
    setIsLoading(false);
  };

  return {
    isLoading,
    getSourceControlCrewInfo,
    isGetAllCrews,
    stepFailedStatus,
  };
};
