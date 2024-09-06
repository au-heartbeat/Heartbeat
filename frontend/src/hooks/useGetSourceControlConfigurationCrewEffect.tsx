import { DateRange, selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { ISourceControlGetCrewResponseDTO } from '@src/clients/sourceControl/dto/response';
import { selectShouldGetSourceControlConfig } from '@src/context/Metrics/metricsSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { FULFILLED, REJECTED, SourceControlTypes } from '@src/constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

export interface IUseGetSourceControlConfigurationCrewInterface {
  readonly isLoading: boolean;
  readonly isGetAllCrews: boolean;
  readonly info: ISourceControlGetCrewResponseDTO;
  readonly getSourceControlCrewInfo: (
    organization: string,
    repo: string,
    branch: string,
    dateRanges: DateRange[],
  ) => Promise<void>;
  readonly stepFailedStatus: MetricsDataFailStatus;
}

export const useGetSourceControlConfigurationCrewEffect = (): IUseGetSourceControlConfigurationCrewInterface => {
  const defaultInfoStructure = {
    code: 200,
    errorTitle: '',
    errorMessage: '',
  };

  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
  const [isGetAllCrews, setIsGetAllCrews] = useState<boolean>(!shouldGetSourceControlConfig);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);
  const [stepFailedStatus, setStepFailedStatus] = useState(MetricsDataFailStatus.NotFailed);
  const [info, setInfo] = useState<ISourceControlGetCrewResponseDTO>(defaultInfoStructure);

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
      const rejectedStep = allCrewsRes.find((stepInfo) => stepInfo.status === REJECTED);
      if ((rejectedStep as PromiseRejectedResult).reason.code == 400) {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailedTimeout);
      }
    }

    allCrewsRes.forEach((response, index) => {
      if (response.status === FULFILLED) {
        if (response.value.code !== HttpStatusCode.Ok) {
          setInfo(response.value);
        } else {
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
              names: response.value.data?.crews.map((it) => it),
            }),
          );
        }
      }
    });

    setIsLoading(false);
    setIsGetAllCrews(true);
  };

  return {
    isLoading,
    getSourceControlCrewInfo,
    isGetAllCrews,
    info,
    stepFailedStatus,
  };
};
