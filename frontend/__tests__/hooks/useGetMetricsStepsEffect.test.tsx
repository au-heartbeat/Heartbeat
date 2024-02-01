import { InternalServerException } from '@src/exceptions/InternalServerException';
import { ERROR_MESSAGE_TIME_DURATION, MOCK_GET_STEPS_PARAMS } from '../fixtures';
import { useGetMetricsStepsEffect } from '@src/hooks/useGetMetricsStepsEffect';
import { metricsClient } from '@src/clients/MetricsClient';
import { act, renderHook } from '@testing-library/react';
import { HttpStatusCode } from 'axios';
import {setupStore} from "@test/utils/setupStoreUtil";
import {Provider} from "react-redux";
import {ContextProvider} from "@src/hooks/useMetricsStepValidationCheckContext";
import React from "react";

const setup = () => {
  const store = setupStore();
  const wrapper = ({children}: { children: React.ReactNode }) => (
    <Provider store={store}>
      <ContextProvider>{children}</ContextProvider>
    </Provider>
  );
  return renderHook(() => useGetMetricsStepsEffect(), {wrapper});
};

describe('use get steps effect', () => {
  const { params, buildId, organizationId, pipelineType, token } = MOCK_GET_STEPS_PARAMS;
  it('should init data state when render hook', async () => {
    const { result } = setup();

    expect(result.current.isLoading).toEqual(false);
  });

  it('should set error message when get steps throw error', async () => {
    jest.useFakeTimers();
    metricsClient.getSteps = jest.fn().mockImplementation(() => {
      throw new Error('error');
    });
    const { result } = setup();

    expect(result.current.isLoading).toEqual(false);

    act(() => {
      result.current.getSteps(params, buildId, organizationId, pipelineType, token);
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION);
    });

    expect(result.current.errorMessage).toEqual('');
  });

  it('should set error message when get steps response status 500', async () => {
    metricsClient.getSteps = jest.fn().mockImplementation(() => {
      throw new InternalServerException('error message', HttpStatusCode.InternalServerError);
    });
    const { result } = setup();

    act(() => {
      result.current.getSteps(params, buildId, organizationId, pipelineType, token);
    });

    expect(result.current.errorMessage).toEqual('Failed to get BuildKite steps: error message');
  });
});
