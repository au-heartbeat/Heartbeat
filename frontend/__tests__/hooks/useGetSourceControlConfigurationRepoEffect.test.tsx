import { useGetSourceControlConfigurationRepoEffect } from '@src/hooks/useGetSourceControlConfigurationRepoEffect';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { MOCK_GITHUB_GET_REPO_RESPONSE } from '@test/fixtures';
import { DateRange } from '@src/context/config/configSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';

const mockDispatch = jest.fn();
const store = setupStore();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: <TSelected>() => TSelected) => {
    const originalUseSelector = jest.requireActual('react-redux').useSelector;
    if (selector.name === 'selectShouldGetSourceControlConfig') {
      return true;
    }
    return originalUseSelector(selector);
  },
}));
const Wrapper = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

const clientSpy = jest.fn();
const mockRepo = jest.fn().mockImplementation(() => {
  clientSpy();
  return MOCK_GITHUB_GET_REPO_RESPONSE;
});

describe('use get source control configuration repo info side effect', () => {
  beforeEach(() => {
    sourceControlClient.getRepo = mockRepo;
    clientSpy.mockClear();
  });
  it('should init data state when render hook', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationRepoEffect(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isGetRepo).toBeFalsy();
  });

  it('should return success data and loading state when client goes happy path', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationRepoEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockDateRanges: DateRange[] = [
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
    ];

    await act(async () => {
      result.current.getSourceControlRepoInfo(mockOrganization, mockDateRanges, 1);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.isGetRepo).toBeTruthy();
    });
    expect(clientSpy).toBeCalled();
  });

  it('should set error step failed status to PartialFailedTimeout when one of getting repo responses is failed and code is not 400', async () => {
    sourceControlClient.getRepo = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.reject({
          code: 500,
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          name: ['test-repo'],
        });
      });
    const { result } = renderHook(() => useGetSourceControlConfigurationRepoEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockDateRanges: DateRange[] = [
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
    ];

    await act(async () => {
      result.current.getSourceControlRepoInfo(mockOrganization, mockDateRanges, 1);
    });

    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.PartialFailedTimeout);
  });

  it('should set error step failed status to PartialFailed4xx when one of getting repo response is failed and code is 4xx', async () => {
    sourceControlClient.getRepo = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.reject({
          code: 400,
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          name: ['test-repo'],
        });
      });
    const { result } = renderHook(() => useGetSourceControlConfigurationRepoEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockDateRanges: DateRange[] = [
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
    ];

    await act(async () => {
      result.current.getSourceControlRepoInfo(mockOrganization, mockDateRanges, 1);
    });

    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.PartialFailed4xx);
  });

  it('should set error step failed status to AllFailed4xx when all getting repo response is failed and code are 4xx', async () => {
    sourceControlClient.getRepo = jest.fn().mockImplementation(() => {
      return Promise.reject({
        code: 400,
      });
    });
    const { result } = renderHook(() => useGetSourceControlConfigurationRepoEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockDateRanges: DateRange[] = [
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
    ];

    await act(async () => {
      result.current.getSourceControlRepoInfo(mockOrganization, mockDateRanges, 1);
    });

    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.AllFailed4xx);
  });

  it('should set error step failed status to AllFailedTimeout when all getting repo response is failed and code are not 4xx', async () => {
    sourceControlClient.getRepo = jest.fn().mockImplementation(() => {
      return Promise.reject({
        code: 500,
      });
    });
    const { result } = renderHook(() => useGetSourceControlConfigurationRepoEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockDateRanges: DateRange[] = [
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
      {
        startDate: 'startTime',
        endDate: 'endTime',
      },
    ];

    await act(async () => {
      result.current.getSourceControlRepoInfo(mockOrganization, mockDateRanges, 1);
    });

    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.AllFailedTimeout);
  });
});
