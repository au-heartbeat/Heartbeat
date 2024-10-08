import {
  clearSourceControlVerifiedResponse,
  selectDateRange,
  selectSourceControl,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import {
  selectShouldGetSourceControlConfig,
  updateSourceControlConfigurationSettingsFirstInto,
} from '@src/context/Metrics/metricsSlice';
import { ISourceControlGetOrganizationResponseDTO } from '@src/clients/sourceControl/dto/response';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { updateMetricsPageLoadingStatus } from '@src/context/stepper/StepperSlice';
import { useAppDispatch, useAppSelector } from '@src/hooks/index';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SourceControlTypes } from '@src/constants/resources';
import { formatDateToTimestampString } from '@src/utils/util';
import { HttpStatusCode } from 'axios';

export interface IUseGetSourceControlConfigurationStateInterface {
  readonly isLoading: boolean;
  readonly getSourceControlInfo: () => Promise<void>;
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
    const dateRangeList = useAppSelector(selectDateRange);

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
      dispatch(
        updateMetricsPageLoadingStatus(
          dateRangeList.map((it) => {
            return {
              startDate: formatDateToTimestampString(it.startDate!),
              loadingStatus: {
                sourceControlOrganization: {
                  isLoading: true,
                  isLoaded: false,
                  isLoadedWithError: false,
                },
              },
            };
          }),
        ),
      );
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
          dispatch(
            updateSourceControlConfigurationSettingsFirstInto({
              ...response.data,
              type: 'organization',
            }),
          );
        }
        dispatch(
          updateMetricsPageLoadingStatus(
            dateRangeList.map((dateRange) => ({
              startDate: formatDateToTimestampString(dateRange.startDate!),
              loadingStatus: {
                sourceControlOrganization: {
                  isLoading: false,
                  isLoaded: true,
                  isLoadedWithError: response.code !== HttpStatusCode.Ok,
                },
              },
            })),
          ),
        );
      } finally {
        setIsLoading(false);
        setIsFirstFetch(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, restoredSourceControlInfo.token, restoredSourceControlInfo.type]);

    useEffect(() => {
      if (!apiTouchedRef.current && !isLoading && shouldGetSourceControlConfig) {
        apiTouchedRef.current = true;
        getSourceControlInfo();
      }
    }, [getSourceControlInfo, isLoading, shouldGetSourceControlConfig]);

    useEffect(() => {
      if (shouldGetSourceControlConfig) {
        dispatch(clearSourceControlVerifiedResponse());
      }
    }, [dispatch, restoredSourceControlInfo.token, shouldGetSourceControlConfig]);

    return {
      isLoading,
      getSourceControlInfo,
      info,
      isFirstFetch,
    };
  };
