import { updateShouldRetryPipelineConfig } from '@src/context/Metrics/metricsSlice';
import { IStepsParams, IStepsRes, metricsClient } from '@src/clients/MetricsClient';
import { updateMetricsPageLoadingStatus } from '@src/context/stepper/StepperSlice';
import { MetricsDataFailStatus, DURATION } from '@src/constants/commons';
import { FULFILLED, MESSAGE, REJECTED } from '@src/constants/resources';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { TimeoutError } from '@src/errors/TimeoutError';
import { useState } from 'react';

export interface useGetMetricsStepsEffectInterface {
  getSteps: (
    params: IStepsParams[],
    organizationId: string,
    buildId: string,
    pipelineType: string,
    token: string,
  ) => Promise<IStepsRes | undefined>;
  isLoading: boolean;
  errorMessage: string;
  stepFailedStatus: MetricsDataFailStatus;
}

const TIMEOUT = 'timeout';

function isAllTimeoutError(allStepsRes: PromiseSettledResult<IStepsRes>[]) {
  return allStepsRes.every((stepInfo) => {
    return (stepInfo as PromiseRejectedResult).reason instanceof TimeoutError;
  });
}

export const useGetMetricsStepsEffect = (): useGetMetricsStepsEffectInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stepFailedStatus, setStepFailedStatus] = useState(MetricsDataFailStatus.NotFailed);

  const getSteps = async (
    params: IStepsParams[],
    organizationId: string,
    buildId: string,
    pipelineType: string,
    token: string,
  ) => {
    setIsLoading(true);

    dispatch(
      updateMetricsPageLoadingStatus(
        params.map((param) => {
          return {
            startDate: param.startTime,
            loadingStatus: {
              pipelineStep: {
                isLoading: true,
                isLoaded: false,
                isLoadedWithError: false,
              },
            },
          };
        }),
      ),
    );

    const allStepsRes = await Promise.allSettled<IStepsRes>(
      params.map((param) => {
        return metricsClient.getSteps(param, organizationId, buildId, pipelineType, token);
      }),
    );
    const hasRejected = allStepsRes.some((stepInfo) => stepInfo.status === REJECTED);
    const hasFulfilled = allStepsRes.some((stepInfo) => stepInfo.status === FULFILLED);

    dispatch(
      updateMetricsPageLoadingStatus(
        params.map((param, index) => {
          return {
            startDate: param.startTime,
            loadingStatus: {
              pipelineStep: {
                isLoading: false,
                isLoaded: true,
                isLoadedWithError: allStepsRes[index].status === REJECTED,
              },
            },
          };
        }),
      ),
    );
    if (!hasRejected) {
      setStepFailedStatus(MetricsDataFailStatus.NotFailed);
    } else if (hasRejected && hasFulfilled) {
      const rejectedStep = allStepsRes.find((stepInfo) => stepInfo.status === REJECTED);
      if ((rejectedStep as PromiseRejectedResult).reason.code == 400) {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailed4xx);
      } else {
        setStepFailedStatus(MetricsDataFailStatus.PartialFailedTimeout);
      }
    }
    setIsLoading(false);
    if (allStepsRes.every((stepInfo) => stepInfo.status === REJECTED)) {
      if (isAllTimeoutError(allStepsRes)) {
        dispatch(updateShouldRetryPipelineConfig(true));
        setErrorMessageAndTime(pipelineType, TIMEOUT);
        return;
      }
      setErrorMessageAndTime(pipelineType);
      return;
    }

    return allStepsRes
      .filter((stepInfo) => stepInfo.status === FULFILLED)
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
  };

  const setErrorMessageAndTime = (pipelineType: string, errReason?: string) => {
    setErrorMessage(`${MESSAGE.GET_STEPS_FAILED} ${pipelineType} steps${errReason ? ': ' + errReason : ''}`);
    setTimeout(() => {
      setErrorMessage('');
    }, DURATION.ERROR_MESSAGE_TIME);
  };

  return { isLoading, getSteps, errorMessage, stepFailedStatus };
};
