import { DateRange, selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { FULFILLED, SourceControlTypes } from '@src/constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
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
}
export const useGetSourceControlConfigurationCrewEffect = (): IUseGetSourceControlConfigurationCrewInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGetAllCrews, setIsGetAllCrews] = useState<boolean>(false);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);

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

    allCrewsRes.forEach((response, index) => {
      if (response.status === FULFILLED) {
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
    });
    setIsLoading(false);
    setIsGetAllCrews(true);
  };

  return {
    isLoading,
    getSourceControlCrewInfo,
    isGetAllCrews,
  };
};
