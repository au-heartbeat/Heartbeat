import { selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { SourceControlTypes } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export interface IUseGetSourceControlConfigurationStateInterface {
  readonly isLoading: boolean;
  readonly getSourceControlCrewInfo: (
    organization: string,
    repo: string,
    branch: string,
    startTime: number,
    endTime: number,
  ) => void;
}
export const useGetSourceControlConfigurationCrewEffect = (): IUseGetSourceControlConfigurationStateInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    startTime: number,
    endTime: number,
  ) => {
    setIsLoading(true);
    const params = {
      type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
      token: restoredSourceControlInfo.token,
      organization,
      repo,
      branch,
      startTime,
      endTime,
    };
    try {
      const response = await sourceControlClient.getCrew(params);
      if (response.code === HttpStatusCode.Ok) {
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
            names: response.data?.crews.map((it) => it),
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getSourceControlCrewInfo,
  };
};
