import { ERROR_MESSAGE_TIME_DURATION, MOCK_GET_STEPS_PARAMS } from '../fixtures';
import { useGetMetricsStepsEffect } from '@src/hooks/useGetMetricsStepsEffect';
import { AXIOS_REQUEST_ERROR_CODE } from '@src/constants/resources';
import { metricsClient } from '@src/clients/MetricsClient';
import { act, renderHook } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import { TimeoutError } from '@src/errors/TimeoutError';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';

const mockDispatch = jest.fn();
jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  updateShouldRetryPipelineConfig: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('use get steps effect', () => {
  const { params, buildId, organizationId, pipelineType, token } = MOCK_GET_STEPS_PARAMS;
  const store = setupStore();
  const wrapper = ({ children }: { children: ReactNode }) => {
    return <Provider store={store}>{children}</Provider>;
  };

  const setup = () => renderHook(() => useGetMetricsStepsEffect(), { wrapper });
  it('should init data state when render hook', async () => {
    const { result } = renderHook(() => useGetMetricsStepsEffect());

    expect(result.current.isLoading).toEqual(false);
  });

  it('should set error message when get steps throw error', async () => {
    jest.useFakeTimers();
    metricsClient.getSteps = jest.fn().mockImplementation(() => {
      return Promise.reject({
        status: 'rejected',
        reason: 'error',
        value: '',
      });
    });
    const { result } = setup();

    expect(result.current.isLoading).toEqual(false);

    act(() => {
      result.current.getSteps(params, buildId, organizationId, pipelineType, token);
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION);
    });

    expect(result.current.errorMessage).toEqual('');
  });

  it('should set error message when get steps responses are failed', async () => {
    metricsClient.getSteps = jest.fn().mockImplementation(() => {
      return Promise.reject('error');
    });
    const { result } = setup();
    const currentParams = [
      ...params,
      {
        pipelineName: 'mock pipeline name',
        repository: 'mock repository',
        orgName: 'mock orgName',
        startTime: 1212112121213,
        endTime: 1313131313134,
      },
    ];
    await act(async () => {
      await result.current.getSteps(currentParams, buildId, organizationId, pipelineType, token);
    });

    expect(result.current.errorMessage).toEqual('Failed to get BuildKite steps');
  });

  it('should set error message when get steps responses are timeout', async () => {
    metricsClient.getSteps = jest.fn().mockImplementation(() => {
      return Promise.reject(new TimeoutError('error', AXIOS_REQUEST_ERROR_CODE.TIMEOUT));
    });
    const { result } = setup();
    const currentParams = [
      ...params,
      {
        pipelineName: 'mock pipeline name',
        repository: 'mock repository',
        orgName: 'mock orgName',
        startTime: 1212112121213,
        endTime: 1313131313134,
      },
    ];
    await act(async () => {
      await result.current.getSteps(currentParams, buildId, organizationId, pipelineType, token);
    });

    expect(result.current.errorMessage).toEqual('Failed to get BuildKite steps: timeout');
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
