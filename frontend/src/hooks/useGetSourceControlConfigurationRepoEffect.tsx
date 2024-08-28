import { selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { SourceControlTypes } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export interface IUseGetSourceControlConfigurationStateInterface {
  readonly isLoading: boolean;
  readonly getSourceControlRepoInfo: (value: string) => void;
}
export const useGetSourceControlConfigurationRepoEffect = (): IUseGetSourceControlConfigurationStateInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  return {
    isLoading,
    getSourceControlRepoInfo,
  };
};
