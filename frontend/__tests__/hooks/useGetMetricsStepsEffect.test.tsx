import { ERROR_MESSAGE_TIME_DURATION, MOCK_GET_STEPS_PARAMS } from '../fixtures';
import { useGetMetricsStepsEffect } from '@src/hooks/useGetMetricsStepsEffect';
import { metricsClient } from '@src/clients/MetricsClient';
import { act, renderHook } from '@testing-library/react';

describe('use get steps effect', () => {
  const { params, buildId, organizationId, pipelineType, token } = MOCK_GET_STEPS_PARAMS;
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
    const { result } = renderHook(() => useGetMetricsStepsEffect());

    expect(result.current.isLoading).toEqual(false);

    act(() => {
      result.current.getSteps(params, buildId, organizationId, pipelineType, token);
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION);
    });

    expect(result.current.errorMessage).toEqual('');
  });

  it('should set error message when get steps response status 500', async () => {
    metricsClient.getSteps = jest.fn().mockImplementation(() => {
      return Promise.reject({
        status: 'rejected',
        reason: 'just test',
        value: '',
      });
    });
    const { result } = renderHook(() => useGetMetricsStepsEffect());
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
});
