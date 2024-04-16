import { IStepsParams, IStepsRes, metricsClient } from '@src/clients/MetricsClient';
import { MESSAGE } from '@src/constants/resources';
import { DURATION } from '@src/constants/commons';
import { useState } from 'react';

export interface useGetMetricsStepsEffectInterface {
  getSteps: (
    params: IStepsParams[],
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

  const getSteps = async (
    params: IStepsParams[],
    organizationId: string,
    buildId: string,
    pipelineType: string,
    token: string,
  ) => {
    setIsLoading(true);
    try {
      const allStepsInfo = await Promise.allSettled<IStepsRes>(
        params.map((param) => {
          return metricsClient.getSteps(param, organizationId, buildId, pipelineType, token);
        }),
      );
      if (allStepsInfo.every((stepInfo) => stepInfo.status === 'rejected')) {
        setErrorMessageAndTime(pipelineType);
        return;
      }

      return allStepsInfo
        .filter((stepInfo) => stepInfo.status === 'fulfilled')
        .map((stepInfo) => (stepInfo as PromiseFulfilledResult<IStepsRes>).value)
        .reduce(
          (accumulator, currentValue) => {
            return {
              response: Array.from(new Set([...accumulator.response, ...currentValue.response])),
              haveStep: accumulator.haveStep || currentValue.haveStep,
              branches: Array.from(new Set([...accumulator.branches, ...currentValue.branches])),
              pipelineCrews: Array.from(new Set([...accumulator.pipelineCrews, ...currentValue.pipelineCrews])),
            };
          },
          {
            response: [],
            haveStep: false,
            branches: [],
            pipelineCrews: [],
          } as IStepsRes,
        );
    } catch (e) {
      setErrorMessageAndTime(pipelineType);
    } finally {
      setIsLoading(false);
    }
  };

  const setErrorMessageAndTime = (pipelineType: string) => {
    setErrorMessage(`${MESSAGE.GET_STEPS_FAILED} ${pipelineType} steps`);
    setTimeout(() => {
      setErrorMessage('');
    }, DURATION.ERROR_MESSAGE_TIME);
  };

  return { isLoading, getSteps, errorMessage };
};
