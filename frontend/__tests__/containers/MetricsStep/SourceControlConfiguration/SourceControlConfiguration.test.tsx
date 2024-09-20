import {
  addOneSourceControlSetting,
  deleteSourceControlConfigurationSettings,
  updateSourceControlConfigurationSettings,
} from '@src/context/Metrics/metricsSlice';
import { IUseGetSourceControlConfigurationStateInterface } from '@src/hooks/useGetSourceControlConfigurationOrganizationEffect';
import { IUseGetSourceControlConfigurationBranchInterface } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { IUseGetSourceControlConfigurationRepoInterface } from '@src/hooks/useGetSourceControlConfigurationRepoEffect';
import { IUseGetSourceControlConfigurationCrewInterface } from '@src/hooks/useGetSourceControlConfigurationCrewEffect';
import { SourceControlConfiguration } from '@src/containers/MetricsStep/SouceControlConfiguration';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { LIST_OPEN, LOADING, REMOVE_BUTTON } from '@test/fixtures';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { setupStore } from '@test/utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const mockInitSourceControlSettings = [
  { id: 0, organization: 'mockOrgName', repo: 'mockRepoName', branches: ['mockBranch1'] },
  { id: 1, organization: '', repo: '', branches: [] },
];
const mockInitOrganizationEffectResponse = {
  isFirstFetch: false,
  isLoading: false,
  getSourceControlInfo: jest.fn(),
  info: {
    code: 200,
    data: {
      name: ['mock-org1', 'mock-org2'],
    },
    errorTitle: '',
    errorMessage: '',
  },
};
const mockInitRepoEffectResponse = {
  isGetRepo: true,
  isLoading: false,
  getSourceControlRepoInfo: jest.fn(),
  info: {
    name: [],
  },
  stepFailedStatus: MetricsDataFailStatus.NotFailed,
};
const mockInitBranchEffectResponse = {
  isLoading: false,
  getSourceControlBranchInfo: jest.fn(),
  isGetBranch: true,
  info: {
    name: [],
  },
  stepFailedStatus: MetricsDataFailStatus.NotFailed,
};
const mockInitCrewEffectResponse = {
  isLoading: false,
  getSourceControlCrewInfo: jest.fn(),
  isGetAllCrews: true,
  info: {
    crews: [],
  },
  stepFailedStatus: MetricsDataFailStatus.NotFailed,
};

let mockSourceControlSettings = mockInitSourceControlSettings;
let mockOrganizationEffectResponse: IUseGetSourceControlConfigurationStateInterface =
  mockInitOrganizationEffectResponse;
let mockRepoEffectResponse: IUseGetSourceControlConfigurationRepoInterface = mockInitRepoEffectResponse;
let mockBranchEffectResponse: IUseGetSourceControlConfigurationBranchInterface = mockInitBranchEffectResponse;
let mockCrewEffectResponse: IUseGetSourceControlConfigurationCrewInterface = mockInitCrewEffectResponse;

const mockValidationCheckContext = {
  getDuplicatedSourceControlIds: jest.fn().mockReturnValue([]),
};
jest.mock('@src/hooks', () => ({
  ...jest.requireActual('@src/hooks'),
  useAppDispatch: () => jest.fn(),
}));
jest.mock('@src/hooks/useMetricsStepValidationCheckContext', () => ({
  useMetricsStepValidationCheckContext: () => mockValidationCheckContext,
}));
jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  selectSourceControlConfigurationSettings: jest.fn().mockImplementation(() => mockSourceControlSettings),
  deleteSourceControlConfigurationSettings: jest.fn(),
  addOneSourceControlSetting: jest.fn(),
  updateSourceControlConfigurationSettings: jest.fn(),
}));
jest.mock('@src/context/config/configSlice', () => ({
  ...jest.requireActual('@src/context/config/configSlice'),
  selectSourceControlOrganizations: jest.fn().mockReturnValue(['mockOrgName', 'mockOrgName1']),
  selectSourceControlRepos: jest.fn().mockImplementation(() => ['mockRepoName']),
  selectSourceControlBranches: jest.fn().mockImplementation(() => ['mockBranchName']),
  selectSourceControlCrews: jest.fn().mockImplementation(() => ['mockCrew']),
  selectDateRange: jest.fn().mockReturnValue([
    { startDate: '2024-07-31T00:00:00.000+08:00', endDate: '2024-08-02T23:59:59.999+08:00' },
    { startDate: '2024-07-15T00:00:00.000+08:00', endDate: '2024-07-28T23:59:59.999+08:00' },
  ]),
}));

jest.mock('@src/hooks/useGetSourceControlConfigurationOrganizationEffect', () => {
  return { useGetSourceControlConfigurationOrganizationEffect: () => mockOrganizationEffectResponse };
});
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

describe('SourceControlConfiguration', () => {
  let store = null;
  const setup = () => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <SourceControlConfiguration />
      </Provider>,
    );
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    mockSourceControlSettings = mockInitSourceControlSettings;
    mockOrganizationEffectResponse = mockInitOrganizationEffectResponse;
    mockRepoEffectResponse = mockInitRepoEffectResponse;
    mockBranchEffectResponse = mockInitBranchEffectResponse;
    mockCrewEffectResponse = mockInitCrewEffectResponse;
  });

  it('should show loading when isLoading is true', () => {
    mockOrganizationEffectResponse = {
      ...mockOrganizationEffectResponse,
      isLoading: true,
    };
    setup();

    expect(screen.getByTestId(LOADING)).toBeInTheDocument();
  });

  it('should not show loading when isLoading is false', () => {
    setup();

    expect(screen.queryByTestId(LOADING)).not.toBeInTheDocument();
  });

  it('should not show SourceControlMetricSelection when isFirstFetch is true', () => {
    mockOrganizationEffectResponse = {
      ...mockOrganizationEffectResponse,
      isFirstFetch: true,
    };
    setup();

    expect(screen.queryByTestId(`single-selection-organization`)).not.toBeInTheDocument();
  });

  it('should show Source control metric selection and show crew', async () => {
    mockOrganizationEffectResponse = {
      ...mockOrganizationEffectResponse,
      isLoading: false,
      isFirstFetch: false,
    };
    setup();

    const combobox = screen.getAllByRole('combobox');
    await act(async () => {
      expect(combobox[0]).toHaveValue('mockOrgName');
      expect(combobox[1]).toHaveValue('mockRepoName');
      expect(combobox[2]).toHaveValue('');
      expect(combobox[3]).toHaveValue('');
    });

    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: LIST_OPEN })[3]);
    });
    const listBox = within(screen.getByRole('listbox'));
    await act(async () => {
      await userEvent.click(listBox.getByText('mockOrgName1'));
    });
    expect(updateSourceControlConfigurationSettings).toHaveBeenCalledTimes(1);

    waitFor(() => {
      expect(screen.getByText('Crew setting (optional)')).toBeInTheDocument();
    });
  });

  it('should call addOneSourceControlSetting function when click add another source control button', async () => {
    setup();
    expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByTestId('AddIcon'));
    });

    expect(addOneSourceControlSetting).toHaveBeenCalledTimes(1);
  });

  it('should call deleteSourceControlConfigurationSettings function when click remove pipeline button', async () => {
    setup();

    await act(async () => {
      await userEvent.click(screen.getAllByRole('button', { name: REMOVE_BUTTON })[0]);
    });
    expect(deleteSourceControlConfigurationSettings).toHaveBeenCalledTimes(1);
  });

  it('should display error UI when get organization info client returns non-200 code', () => {
    mockOrganizationEffectResponse = {
      isFirstFetch: false,
      isLoading: false,
      getSourceControlInfo: jest.fn(),
      info: {
        code: 403,
        errorTitle: 'Forbidden request!',
        errorMessage: 'Forbidden request!',
      },
    };
    setup();

    expect(screen.getByLabelText('Error UI for pipeline settings')).toBeInTheDocument();
  });

  it('should show crews when all crews are not loading', () => {
    mockSourceControlSettings = [
      { id: 0, organization: 'mockOrgName', repo: 'mockRepoName', branches: ['mockBranch1'] },
    ];
    setup();

    expect(screen.getByText('Crew setting (optional)')).toBeInTheDocument();
  });

  it('should set error info when any request return error', () => {
    mockOrganizationEffectResponse = {
      ...mockOrganizationEffectResponse,
      info: {
        code: 404,
        errorTitle: 'error title',
        errorMessage: 'error message',
      },
    };
    setup();

    expect(screen.getByLabelText('Error UI for pipeline settings')).toBeInTheDocument();
  });

  it('should display error UI and retry when get repo failed status returns AllFailedTimeout', async () => {
    const getSourceControlInfo = jest.fn();
    mockRepoEffectResponse = {
      ...mockInitRepoEffectResponse,
      stepFailedStatus: MetricsDataFailStatus.AllFailedTimeout,
    };
    mockOrganizationEffectResponse = {
      ...mockInitOrganizationEffectResponse,
      getSourceControlInfo,
    };
    setup();

    const retryButton = screen.getByLabelText('retry button');

    expect(screen.getByLabelText('Error UI for pipeline settings')).toBeInTheDocument();
    expect(retryButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(retryButton);
    });

    expect(getSourceControlInfo).toHaveBeenCalledTimes(1);
  });

  it('should display error UI and retry when get branch failed status returns AllFailedTimeout', async () => {
    const getSourceControlInfo = jest.fn();
    mockBranchEffectResponse = {
      ...mockInitBranchEffectResponse,
      stepFailedStatus: MetricsDataFailStatus.AllFailedTimeout,
    };
    mockOrganizationEffectResponse = {
      ...mockInitOrganizationEffectResponse,
      getSourceControlInfo,
    };
    setup();

    const retryButton = screen.getByLabelText('retry button');

    expect(screen.getByLabelText('Error UI for pipeline settings')).toBeInTheDocument();
    expect(retryButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(retryButton);
    });

    expect(getSourceControlInfo).toHaveBeenCalledTimes(1);
  });

  it('should display error UI and retry when get crew failed status returns AllFailedTimeout', async () => {
    const getSourceControlInfo = jest.fn();
    mockCrewEffectResponse = {
      ...mockInitCrewEffectResponse,
      stepFailedStatus: MetricsDataFailStatus.AllFailedTimeout,
    };
    mockOrganizationEffectResponse = {
      ...mockInitOrganizationEffectResponse,
      getSourceControlInfo,
    };
    mockSourceControlSettings = [
      { id: 0, organization: 'mockOrgName', repo: 'mockRepoName', branches: ['mockBranch1'] },
      { id: 1, organization: 'mockOrgName', repo: 'mockRepoName', branches: ['mockBranch2'] },
    ];
    setup();

    const retryButton = screen.getByLabelText('retry button');

    expect(screen.getByLabelText('Error UI for pipeline settings')).toBeInTheDocument();
    expect(retryButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(retryButton);
    });

    expect(getSourceControlInfo).toHaveBeenCalledTimes(1);
  });
});
