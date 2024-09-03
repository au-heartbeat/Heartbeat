import { useGetSourceControlConfigurationBranchEffect } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { MOCK_GITHUB_GET_BRANCHES_RESPONSE } from '@test/fixtures';
import { act, renderHook, waitFor } from '@testing-library/react';
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
    data: MOCK_GITHUB_GET_BRANCHES_RESPONSE,
    errorTittle: '',
    errorMessage: '',
  };
});

beforeEach(() => {
  sourceControlClient.getBranch = mockRepo;
  clientSpy.mockClear();
});

describe('use get source control configuration branch info side effect', () => {
  it('should init data state when render hook', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isGetBranch).toBeFalsy();
  });

  it('should return success data and loading state when client goes happy path', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationBranchEffect(), { wrapper: Wrapper });
    const mockOrganization = 'mockOrg';
    const mockRepo = 'mockRepo';

    await act(async () => {
      result.current.getSourceControlBranchInfo(mockOrganization, mockRepo);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.isGetBranch).toBeTruthy();
    });
    expect(clientSpy).toBeCalled();
  });
});