import { useGetSourceControlConfigurationBranchEffect } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { MOCK_GITHUB_GET_BRANCHES_RESPONSE } from '@test/fixtures';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { setupStore } from '@test/utils/setupStoreUtil';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { HttpStatusCode } from 'axios';

const mockDispatch = jest.fn();
const store = setupStore();
jest.mock('@src/hooks', () => ({
  ...jest.requireActual('@src/hooks'),
  useAppDispatch: () => jest.fn(),
}));
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
  return new Promise(() => {
    return {
      code: HttpStatusCode.Ok,
      data: MOCK_GITHUB_GET_BRANCHES_RESPONSE,
      errorTittle: '',
      errorMessage: '',
    };
  });
});

describe('use get source control configuration branch info side effect', () => {
  beforeEach(() => {
    sourceControlClient.getBranch = mockRepo;
    clientSpy.mockClear();
  });

  it('should init data state when render hook', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isGetBranch).toBeFalsy();
  });

  it('should return success data and loading state when client return 200', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    sourceControlClient.getBranch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        code: 200,
        data: {
          name: ['test-branch1', 'test-branch2'],
        },
      });
    });
    await act(async () => {
      result.current.getSourceControlBranchInfo(mockOrganization, mockRepo, 1);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.isGetBranch).toBeTruthy();
    });

    expect(sourceControlClient.getBranch).toBeCalled();
  });

  it('should set error info when client dont return 200', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    sourceControlClient.getBranch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        code: 400,
      });
    });
    await act(async () => {
      result.current.getSourceControlBranchInfo(mockOrganization, mockRepo, 1);
    });

    expect(sourceControlClient.getBranch).toBeCalled();
    expect(result.current.info).toEqual({
      code: 400,
    });
  });

  it('should set error step failed status to PartialFailed4xx when getting branch response is failed and client return 400', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    sourceControlClient.getBranch = jest.fn().mockImplementation(() => {
      return Promise.reject({
        reason: {
          code: 400,
        },
      });
    });
    await act(async () => {
      result.current.getSourceControlBranchInfo(mockOrganization, mockRepo, 1);
    });

    expect(sourceControlClient.getBranch).toBeCalled();
    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.PartialFailed4xx);
  });

  it('should set error step failed status to PartialFailedTimeout when getting branch response is failed and client dont return 400', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';
    sourceControlClient.getBranch = jest.fn().mockImplementation(() => {
      return Promise.reject({
        reason: {
          code: 404,
        },
      });
    });
    await act(async () => {
      result.current.getSourceControlBranchInfo(mockOrganization, mockRepo, 1);
    });

    expect(sourceControlClient.getBranch).toBeCalled();
    expect(result.current.stepFailedStatus).toEqual(MetricsDataFailStatus.PartialFailedTimeout);
  });
});
