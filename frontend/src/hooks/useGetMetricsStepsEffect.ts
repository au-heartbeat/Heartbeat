import { getStepsParams, metricsClient } from '@src/clients/MetricsClient';
import { MESSAGE } from '@src/constants/resources';
import { DURATION } from '@src/constants/commons';
import { useState } from 'react';
import { shouldCallStepApi, updatePipelineToolShouldCallStepApi } from "@src/context/config/configSlice";
import { useAppDispatch, useAppSelector } from "@src/hooks/index";

export interface useGetMetricsStepsEffectInterface {
  getSteps: (
    params: getStepsParams,
    organizationId: string,
    buildId: string,
    pipelineType: string,
    token: string,
  ) => Promise<
    | {
        haveStep: boolean;
        response: string[];
        branches: string[];
        pipelineCrews: string[];
      }
    | undefined
  >;
  isLoading: boolean;
  errorMessage: string;
}

export const useGetMetricsStepsEffect = (): useGetMetricsStepsEffectInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const shouldCallApi = useAppSelector(shouldCallStepApi);
  const dispatch = useAppDispatch();

  const getSteps = async (
    params: getStepsParams,
    organizationId: string,
    buildId: string,
    pipelineType: string,
    token: string,
  ) => {
    setIsLoading(true);
    try {
      return await metricsClient.getSteps(params, organizationId, buildId, pipelineType, token);
    } catch (e) {
      const err = e as Error;
      setErrorMessage(`${MESSAGE.GET_STEPS_FAILED} ${pipelineType} steps: ${err.message}`);
      setTimeout(() => {
        setErrorMessage('');
      }, DURATION.ERROR_MESSAGE_TIME);
    } finally {
      shouldCallApi && dispatch(updatePipelineToolShouldCallStepApi(false));
      setIsLoading(false);
    }
  };

  return { isLoading, getSteps, errorMessage };
};
