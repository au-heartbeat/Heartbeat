import { useGetSourceControlConfigurationCrewEffect } from '@src/hooks/useGetSourceControlConfigurationCrewEffect';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MOCK_GITHUB_GET_CREWS_RESPONSE } from '@test/fixtures';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { DateRange } from '@src/context/config/configSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { HttpStatusCode } from 'axios';

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
  return {
    code: HttpStatusCode.Ok,
    data: MOCK_GITHUB_GET_CREWS_RESPONSE,
    errorTittle: '',
    errorMessage: '',
  };
});

describe('use get source control configuration crew info side effect', () => {
  beforeEach(() => {
    sourceControlClient.getCrew = mockRepo;
    clientSpy.mockClear();
  });

  it('should init data state when render hook', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationCrewEffect(), { wrapper: Wrapper });
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isGetAllCrews).toBeFalsy();
  });

  it('should return success data and loading state when client goes happy path', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationCrewEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    const mockBranch = 'mockBranch';
    const dateRanges: DateRange[] = [
      {
        startDate: '2024-07-31T00:00:00.000+08:00',
        endDate: '2024-08-02T23:59:59.999+08:00',
      },
      {
        startDate: '2024-07-15T00:00:00.000+08:00',
        endDate: '2024-07-28T23:59:59.999+08:00',
      },
    ];

    await act(async () => {
      result.current.getSourceControlCrewInfo(mockOrganization, mockRepo, mockBranch, dateRanges);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.isGetAllCrews).toBeTruthy();
    });
    expect(clientSpy).toHaveBeenCalledTimes(2);
  });

  it('should set error step failed status to PartialFailed4xx when one of getting repo response is failed and code is 400', async () => {
    sourceControlClient.getCrew = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.reject({
          code: 400,
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve('success');
      });
    const { result } = renderHook(() => useGetSourceControlConfigurationCrewEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    const mockBranch = 'mockBranch';
    const dateRanges: DateRange[] = [
      {
        startDate: '2024-07-31T00:00:00.000+08:00',
        endDate: '2024-08-02T23:59:59.999+08:00',
      },
      {
        startDate: '2024-07-15T00:00:00.000+08:00',
        endDate: '2024-07-28T23:59:59.999+08:00',
      },
    ];

    await act(async () => {
      result.current.getSourceControlCrewInfo(mockOrganization, mockRepo, mockBranch, dateRanges);
    });

    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.PartialFailed4xx);
  });

  it('should set error step failed status to PartialFailedTimeout when one of getting repo responses is failed and code is not 400', async () => {
    sourceControlClient.getCrew = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.reject('error');
      })
      .mockImplementationOnce(() => {
        return Promise.resolve('success');
      });
    const { result } = renderHook(() => useGetSourceControlConfigurationCrewEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    const mockBranch = 'mockBranch';
    const dateRanges: DateRange[] = [
      {
        startDate: '2024-07-31T00:00:00.000+08:00',
        endDate: '2024-08-02T23:59:59.999+08:00',
      },
      {
        startDate: '2024-07-15T00:00:00.000+08:00',
        endDate: '2024-07-28T23:59:59.999+08:00',
      },
    ];

    await act(async () => {
      result.current.getSourceControlCrewInfo(mockOrganization, mockRepo, mockBranch, dateRanges);
    });

    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.PartialFailedTimeout);
  });
});
