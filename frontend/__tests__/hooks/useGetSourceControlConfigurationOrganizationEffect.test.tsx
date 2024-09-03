import { useGetSourceControlConfigurationOrganizationEffect } from '@src/hooks/useGetSourceControlConfigurationOrganizationEffect';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { MOCK_GITHUB_GET_ORGANIZATION_RESPONSE } from '@test/fixtures';
import { renderHook, waitFor } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { HttpStatusCode } from 'axios';

const mockDispatch = jest.fn();

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
const store = setupStore();
const Wrapper = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

const clientSpy = jest.fn();
const mockOrganization = jest.fn().mockImplementation(() => {
  clientSpy();
  return {
    code: HttpStatusCode.Ok,
    data: MOCK_GITHUB_GET_ORGANIZATION_RESPONSE,
    errorTittle: '',
    errorMessage: '',
  };
});

beforeEach(() => {
  sourceControlClient.getOrganization = mockOrganization;
  clientSpy.mockClear();
});

describe('use get source control configuration organization info side effect', () => {
  it('should return success data and loading state when client goes happy path', async () => {
    const { result } = renderHook(() => useGetSourceControlConfigurationOrganizationEffect(), { wrapper: Wrapper });
    expect(result.current.isLoading).toBeTruthy();
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(clientSpy).toBeCalled();
  });

  it('should not make duplicated call when hook re-renders', async () => {
    const { result, rerender } = renderHook(() => useGetSourceControlConfigurationOrganizationEffect(), {
      wrapper: Wrapper,
    });
    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(clientSpy).toBeCalledTimes(1);
  });
});
