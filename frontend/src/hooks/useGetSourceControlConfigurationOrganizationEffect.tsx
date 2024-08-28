import {
  selectShouldGetPipelineConfig,
  selectShouldGetSourceControlConfig,
  updateSourceControlConfigurationSettingsWhenCreate,
} from '@src/context/Metrics/metricsSlice';
import {
  selectIsProjectCreated,
  selectSourceControl,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import { ISourceControlGetOrganizationResponseDTO } from '@src/clients/sourceControl/dto/response';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SourceControlTypes } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';

export interface IUseGetSourceControlConfigurationStateInterface {
  readonly isLoading: boolean;
  readonly getSourceControlInfo: () => void;
  readonly info: ISourceControlGetOrganizationResponseDTO;
  readonly isFirstFetch: boolean;
}
export const useGetSourceControlConfigurationOrganizationEffect =
  (): IUseGetSourceControlConfigurationStateInterface => {
    const defaultInfoStructure = {
      code: 200,
      errorTitle: '',
      errorMessage: '',
    };
    const dispatch = useAppDispatch();
    const apiTouchedRef = useRef(false);
    const [info, setInfo] = useState<ISourceControlGetOrganizationResponseDTO>(defaultInfoStructure);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const restoredSourceControlInfo = useAppSelector(selectSourceControl);
    const shouldGetSourceControlConfig = useAppSelector(selectShouldGetSourceControlConfig);
    const [isFirstFetch, setIsFirstFetch] = useState(shouldGetSourceControlConfig);
    const isProjectCreated = useAppSelector(selectIsProjectCreated);

    function getEnumKeyByEnumValue(enumValue: string): SourceControlTypes {
      return Object.entries(SourceControlTypes)
        .filter((it) => it[0] === enumValue)
        .map((it) => it[1])[0];
    }

    const getSourceControlInfo = useCallback(async () => {
      const params = {
        type: getEnumKeyByEnumValue(restoredSourceControlInfo.type),
        token: restoredSourceControlInfo.token,
      };
      setIsLoading(true);
      try {
        const response = await sourceControlClient.getOrganization(params);
        setInfo(response);
        if (response.code === HttpStatusCode.Ok) {
          dispatch(
            updateSourceControlVerifiedResponse({
              parents: [],
              names: response.data?.name.map((it) => it),
            }),
          );
          if (isProjectCreated) {
            dispatch(updateSourceControlConfigurationSettingsWhenCreate({ ...response.data }));
          }
        }
      } finally {
        setIsLoading(false);
        setIsFirstFetch(false);
      }
    }, [dispatch, restoredSourceControlInfo.token, restoredSourceControlInfo.type, isProjectCreated]);

    useEffect(() => {
      if (!apiTouchedRef.current && !isLoading) {
        apiTouchedRef.current = true;
        getSourceControlInfo();
      }
    }, [getSourceControlInfo, isLoading]);
    return {
      isLoading,
      getSourceControlInfo,
      info,
      isFirstFetch,
    };
  };
