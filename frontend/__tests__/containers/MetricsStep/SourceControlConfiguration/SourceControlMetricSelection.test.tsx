import { SourceControlMetricSelection } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlMetricSelection';
import { IUseGetSourceControlConfigurationBranchInterface } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { IUseGetSourceControlConfigurationRepoInterface } from '@src/hooks/useGetSourceControlConfigurationRepoEffect';
import { IUseGetSourceControlConfigurationCrewInterface } from '@src/hooks/useGetSourceControlConfigurationCrewEffect';
import { act, render, screen, within } from '@testing-library/react';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { setupStore } from '@test/utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { LIST_OPEN, LOADING } from '@test/fixtures';
import { Provider } from 'react-redux';

const mockInitRepoEffectResponse = {
  isGetRepo: true,
  isLoading: false,
  getSourceControlRepoInfo: jest.fn(),
  stepFailedStatus: MetricsDataFailStatus.NotFailed,
};
const mockInitBranchEffectResponse = {
  isLoading: false,
  getSourceControlBranchInfo: jest.fn(),
  isGetBranch: true,
  stepFailedStatus: MetricsDataFailStatus.NotFailed,
};
const mockInitCrewEffectResponse = {
  isLoading: false,
  getSourceControlCrewInfo: jest.fn(),
  isGetAllCrews: true,
  stepFailedStatus: MetricsDataFailStatus.NotFailed,
};

let mockRepoEffectResponse: IUseGetSourceControlConfigurationRepoInterface = mockInitRepoEffectResponse;
let mockBranchEffectResponse: IUseGetSourceControlConfigurationBranchInterface = mockInitBranchEffectResponse;
let mockCrewEffectResponse: IUseGetSourceControlConfigurationCrewInterface = mockInitCrewEffectResponse;

const mockInitSelectSourceControlRepos = ['mockRepoName', 'mockRepoName1'];
let mockSelectSourceControlRepos = mockInitSelectSourceControlRepos;

const mockInitSelectSourceControlBranches = ['mockBranchName', 'mockBranchName1'];
let mockSelectSourceControlBranches = mockInitSelectSourceControlBranches;

const myDispatch = jest.fn();
jest.mock('@src/hooks', () => ({
  ...jest.requireActual('@src/hooks'),
  useAppDispatch: () => myDispatch,
}));
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

jest.mock('@src/context/notification/NotificationSlice', () => ({
  ...jest.requireActual('@src/context/notification/NotificationSlice'),
  addNotification: jest.fn(),
}));
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
  selectSourceControlTimes: jest.fn().mockReturnValue([]),
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
  afterEach(() => {
    jest.clearAllMocks();
  });
  const onUpdateSourceControl = jest.fn();
  const handleUpdateErrorInfo = jest.fn();
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
          handleUpdateErrorInfo={handleUpdateErrorInfo}
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
    expect(getSourceControlBranchInfoFunction).toHaveBeenCalledTimes(0);
    expect(getSourceControlCrewInfoFunction).toHaveBeenCalledTimes(2);
  });

  it('should update source control when get repo is empty', async () => {
    mockSelectSourceControlRepos = [];
    setup();

    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: LIST_OPEN })[0]);
    });
    const listBox = within(screen.getByRole('listbox'));
    await act(async () => {
      await userEvent.click(listBox.getByText('mockOrgName1'));
    });
    const getSourceControlRepoInfo = jest.fn();
    mockRepoEffectResponse = {
      ...mockRepoEffectResponse,
      getSourceControlRepoInfo,
    };

    expect(onUpdateSourceControl).toHaveBeenCalledTimes(1);
  });

  it('should update source control when get branch is empty', async () => {
    mockSelectSourceControlBranches = [];
    setup();

    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: LIST_OPEN })[1]);
    });
    const listBox = within(screen.getByRole('listbox'));
    await act(async () => {
      await userEvent.click(listBox.getByText('mockRepoName1'));
    });
    const getSourceControlBranchInfo = jest.fn();
    mockBranchEffectResponse = {
      ...mockBranchEffectResponse,
      getSourceControlBranchInfo,
    };

    expect(onUpdateSourceControl).toHaveBeenCalledTimes(1);
  });

  it('should update source control when get crew is empty', async () => {
    setup();

    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: LIST_OPEN })[2]);
    });
    const listBox = within(screen.getByRole('listbox'));
    await act(async () => {
      await userEvent.click(listBox.getByText('mockBranchName1'));
    });
    const getSourceControlCrewInfo = jest.fn();
    mockCrewEffectResponse = {
      ...mockCrewEffectResponse,
      getSourceControlCrewInfo,
    };

    expect(onUpdateSourceControl).toHaveBeenCalledTimes(1);
  });

  it('should add partial failed 4xx notification when any failed status is PartialFailed4xx', async () => {
    mockCrewEffectResponse = {
      ...mockCrewEffectResponse,
      stepFailedStatus: MetricsDataFailStatus.PartialFailed4xx,
    };
    setup();

    expect(myDispatch).toHaveBeenCalledTimes(1);
  });

  it('should add partial failed 4xx notification when any failed status is PartialFailedTimeout', async () => {
    mockCrewEffectResponse = {
      ...mockCrewEffectResponse,
      stepFailedStatus: MetricsDataFailStatus.PartialFailedTimeout,
    };
    setup();

    expect(myDispatch).toHaveBeenCalledTimes(1);
  });

  it('should update error info when any failed status is AllFailedTimeout', async () => {
    mockCrewEffectResponse = {
      ...mockCrewEffectResponse,
      stepFailedStatus: MetricsDataFailStatus.AllFailedTimeout,
    };
    setup();

    expect(handleUpdateErrorInfo).toHaveBeenCalledTimes(1);
  });
});
