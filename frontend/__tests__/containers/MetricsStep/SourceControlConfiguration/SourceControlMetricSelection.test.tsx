import { SourceControlMetricSelection } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlMetricSelection';
import { IUseGetSourceControlConfigurationBranchInterface } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { IUseGetSourceControlConfigurationRepoInterface } from '@src/hooks/useGetSourceControlConfigurationRepoEffect';
import { IUseGetSourceControlConfigurationCrewInterface } from '@src/hooks/useGetSourceControlConfigurationCrewEffect';
import { act, render, screen, within } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { LIST_OPEN, LOADING } from '@test/fixtures';
import { Provider } from 'react-redux';

const mockInitRepoEffectResponse = {
  isGetRepo: true,
  isLoading: false,
  getSourceControlRepoInfo: jest.fn(),
};
const mockInitBranchEffectResponse = {
  isLoading: false,
  getSourceControlBranchInfo: jest.fn(),
  isGetBranch: true,
};
const mockInitCrewEffectResponse = {
  isLoading: false,
  getSourceControlCrewInfo: jest.fn(),
  isGetAllCrews: true,
};

let mockRepoEffectResponse: IUseGetSourceControlConfigurationRepoInterface = mockInitRepoEffectResponse;
let mockBranchEffectResponse: IUseGetSourceControlConfigurationBranchInterface = mockInitBranchEffectResponse;
let mockCrewEffectResponse: IUseGetSourceControlConfigurationCrewInterface = mockInitCrewEffectResponse;

const mockInitSelectSourceControlRepos = ['mockRepoName', 'mockRepoName1'];
let mockSelectSourceControlRepos = mockInitSelectSourceControlRepos;

const mockInitSelectSourceControlBranches = ['mockBranchName', 'mockBranchName1'];
let mockSelectSourceControlBranches = mockInitSelectSourceControlBranches;

jest.mock('@src/hooks/useGetSourceControlConfigurationRepoEffect', () => {
  return {
    useGetSourceControlConfigurationRepoEffect: () => mockRepoEffectResponse,
  };
});
jest.mock('@src/hooks/useGetSourceControlConfigurationBranchEffect', () => {
  return {
    useGetSourceControlConfigurationBranchEffect: () => mockBranchEffectResponse,
  };
});
jest.mock('@src/hooks/useGetSourceControlConfigurationCrewEffect', () => {
  return {
    useGetSourceControlConfigurationCrewEffect: () => mockCrewEffectResponse,
  };
});

jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  selectSourceControlConfigurationSettings: jest.fn().mockImplementation(() => [
    { id: 0, organization: 'mockOrgName', repo: 'mockRepoName', branches: ['mockBranch1'] },
    { id: 1, organization: '', repo: '', steps: '', branches: [] },
  ]),
}));
jest.mock('@src/context/config/configSlice', () => ({
  ...jest.requireActual('@src/context/config/configSlice'),
  selectSourceControlOrganizations: jest.fn().mockReturnValue(['mockOrgName', 'mockOrgName1']),
  selectSourceControlRepos: jest.fn().mockImplementation(() => mockSelectSourceControlRepos),
  selectSourceControlBranches: jest.fn().mockImplementation(() => mockSelectSourceControlBranches),
  selectDateRange: jest.fn().mockReturnValue([
    { startDate: '2024-07-31T00:00:00.000+08:00', endDate: '2024-08-02T23:59:59.999+08:00' },
    { startDate: '2024-07-15T00:00:00.000+08:00', endDate: '2024-07-28T23:59:59.999+08:00' },
  ]),
}));

const store = setupStore();

describe('SourceControlMetricSelection', () => {
  beforeEach(() => {
    mockRepoEffectResponse = mockInitRepoEffectResponse;
    mockBranchEffectResponse = mockInitBranchEffectResponse;
    mockCrewEffectResponse = mockInitCrewEffectResponse;
    mockSelectSourceControlBranches = mockInitSelectSourceControlBranches;
    mockSelectSourceControlRepos = mockInitSelectSourceControlRepos;
  });
  const onUpdateSourceControl = jest.fn();
  const setup = (isDuplicated: boolean = false) => {
    const sourceControlSetting = {
      id: 0,
      organization: 'test-org',
      repo: 'test-repo',
      branches: ['test-branch1'],
    };
    return render(
      <Provider store={store}>
        <SourceControlMetricSelection
          sourceControlSetting={sourceControlSetting}
          isShowRemoveButton={true}
          onRemoveSourceControl={jest.fn()}
          onUpdateSourceControl={onUpdateSourceControl}
          isDuplicated={isDuplicated}
          setLoadingCompletedNumber={jest.fn()}
          totalSourceControlNumber={1}
        />
      </Provider>,
    );
  };

  it('should show loading icon when any loading is true', () => {
    mockRepoEffectResponse = {
      ...mockRepoEffectResponse,
      isLoading: true,
    };
    setup();

    expect(screen.getByTestId(LOADING)).toBeInTheDocument();
  });

  it('should show duplicate message when isDuplicate is true', () => {
    setup(true);

    expect(screen.getByText('This source control is the same as another one!')).toBeInTheDocument();
  });

  it('should call getSourceControlRepoInfo function when isGetRepo is false and organization exists', () => {
    mockSelectSourceControlRepos = [];
    const getSourceControlRepoInfoFunction = jest.fn();
    mockRepoEffectResponse = {
      ...mockInitRepoEffectResponse,
      isGetRepo: false,
      getSourceControlRepoInfo: getSourceControlRepoInfoFunction,
    };
    setup();

    expect(getSourceControlRepoInfoFunction).toHaveBeenCalledTimes(1);
  });

  it('should call getSourceControlBranchInfo function when isGetBranch is false and organization and repo exist', () => {
    mockSelectSourceControlBranches = [];
    const getSourceControlBranchInfoFunction = jest.fn();
    mockBranchEffectResponse = {
      ...mockBranchEffectResponse,
      isGetBranch: false,
      getSourceControlBranchInfo: getSourceControlBranchInfoFunction,
    };
    setup();

    expect(getSourceControlBranchInfoFunction).toHaveBeenCalledTimes(1);
  });

  it('should call getSourceControlCrewInfo function when isGetAllCrews is false and organization and repo and selectedBranches exist', () => {
    const getSourceControlCrewInfoFunction = jest.fn();
    mockCrewEffectResponse = {
      ...mockCrewEffectResponse,
      isGetAllCrews: false,
      getSourceControlCrewInfo: getSourceControlCrewInfoFunction,
    };
    setup();

    expect(getSourceControlCrewInfoFunction).toHaveBeenCalledTimes(1);
  });

  it('should update source control', async () => {
    const getSourceControlBranchInfoFunction = jest.fn();
    mockBranchEffectResponse = {
      ...mockBranchEffectResponse,
      getSourceControlBranchInfo: getSourceControlBranchInfoFunction,
    };
    const getSourceControlCrewInfoFunction = jest.fn();
    mockCrewEffectResponse = {
      ...mockCrewEffectResponse,
      isGetAllCrews: false,
      getSourceControlCrewInfo: getSourceControlCrewInfoFunction,
    };
    setup();

    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: LIST_OPEN })[1]);
    });
    let listBox = within(screen.getByRole('listbox'));
    await act(async () => {
      await userEvent.click(listBox.getByText('mockRepoName1'));
    });
    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: LIST_OPEN })[2]);
    });
    listBox = within(screen.getByRole('listbox'));
    await act(async () => {
      await userEvent.click(listBox.getByText('mockBranchName1'));
    });

    expect(onUpdateSourceControl).toHaveBeenCalledTimes(2);
    expect(getSourceControlBranchInfoFunction).toHaveBeenCalledTimes(1);
    expect(getSourceControlCrewInfoFunction).toHaveBeenCalledTimes(2);
  });
});
