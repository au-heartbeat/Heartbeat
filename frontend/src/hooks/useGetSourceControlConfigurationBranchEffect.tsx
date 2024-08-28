import { selectSourceControl, updateSourceControlVerifiedResponse } from '@src/context/config/configSlice';
import {
  ISourceControlGetBranchResponseDTO,
  ISourceControlGetOrganizationResponseDTO
} from '@src/clients/sourceControl/dto/response';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { SourceControlTypes } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export interface IUseGetSourceControlConfigurationStateInterface {
  readonly isLoading: boolean;
  readonly getSourceControlBranchInfo: (organization: string, repo: string) => void;
  readonly info: ISourceControlGetOrganizationResponseDTO;
}
export const useGetSourceControlConfigurationBranchEffect = (): IUseGetSourceControlConfigurationStateInterface => {
  const defaultInfoStructure = {
    code: 200,
    errorTitle: '',
    errorMessage: '',
  };
  const dispatch = useAppDispatch();
  const [info, setInfo] = useState<ISourceControlGetBranchResponseDTO>(defaultInfoStructure);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const restoredSourceControlInfo = useAppSelector(selectSourceControl);

  function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
    return Object.entries(SourceControlTypes)
      .filter((it) => it[0] === enumValue)
      .map((it) => it[1])[0];
  }

  const getSourceControlBranchInfo = async (organization: string, repo: string) => {
    const params = {
      type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
      token: restoredSourceControlInfo.token,
      organization: organization,
      repo: repo,
    };
    setIsLoading(true);
    try {
      const response = await sourceControlClient.getBranch(params);
      setInfo(response);
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getSourceControlBranchInfo,
    info,
  };
};
