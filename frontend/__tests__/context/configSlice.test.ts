import configReducer, {
  resetImportedData,
  selectSourceControlBranches,
  selectSourceControlCrews,
  selectSourceControlOrganizations,
  selectSourceControlRepos,
  selectSteps,
  updateCalendarType,
  updateDateRange,
  updateDateRangeSortType,
  updateMetrics,
  updateProjectCreatedState,
  updateProjectName,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import { CONFIG_PAGE_VERIFY_IMPORT_ERROR_MESSAGE, VELOCITY } from '../fixtures';
import { SortType } from '@src/containers/ConfigStep/DateRangePicker/types';
import { setupStore } from '@test/utils/setupStoreUtil';
import initialConfigState from '../initialConfigState';
import { Calendar } from '@src/constants/resources';
const MockBasicState = {
  projectName: 'Test Project',
  dateRange: [
    {
      startDate: new Date(),
      endDate: new Date(),
    },
  ],
  metrics: ['Velocity', 'Cycle time'],
};
describe('config reducer', () => {
  it('should be default value when init render config page', () => {
    const config = configReducer(undefined, { type: 'unknown' }).basic;

    expect(config.projectName).toEqual('');
    expect(config.calendarType).toEqual(Calendar.Regular);
    expect(config.dateRange).toEqual([{ startDate: null, endDate: null }]);
  });

  it('should update project name when change project name input', () => {
    const config = configReducer(initialConfigState, updateProjectName('mock project name')).basic;

    expect(config.projectName).toEqual('mock project name');
  });

  it('should update calendar when change calendar types', () => {
    const config = configReducer(initialConfigState, updateCalendarType(Calendar.China)).basic;

    expect(config.calendarType).toEqual(Calendar.China);
  });

  it('should update date range when change date', () => {
    const today = new Date().getMilliseconds();
    const config = configReducer(initialConfigState, updateDateRange([{ startDate: today, endDate: '' }])).basic;

    expect(config.dateRange[0].startDate).toEqual(today);
    expect(config.dateRange[0].endDate).toEqual('');
  });

  it('should update date range sort type with given sort type', () => {
    const newSortType = SortType.DEFAULT;
    const config = configReducer(initialConfigState, updateDateRangeSortType(newSortType)).basic;

    expect(config.sortType).toEqual(newSortType);
  });

  it('should isProjectCreated is false when import file', () => {
    const config = configReducer(initialConfigState, updateProjectCreatedState(false));

    expect(config.isProjectCreated).toEqual(false);
  });

  it('should update required data when change require data selections', () => {
    const config = configReducer(initialConfigState, updateMetrics([VELOCITY])).basic;

    expect(config.metrics).toEqual([VELOCITY]);
  });

  it('should set warningMessage when metrics data not include in REQUIRED_DATA', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: false,
    };
    const action = {
      type: 'config/updateBasicConfigState',
      payload: { ...MockBasicState, metrics: ['Metric 1', 'Metric 2'] },
    };

    const config = configReducer(initialState, action);

    expect(config.warningMessage).toBe(CONFIG_PAGE_VERIFY_IMPORT_ERROR_MESSAGE);
  });

  it('should not set warningMessage when projectName startDate endDate and metrics data have value', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: false,
    };
    const action = {
      type: 'config/updateBasicConfigState',
      payload: MockBasicState,
    };

    const config = configReducer(initialState, action);

    expect(config.warningMessage).toBeNull();
  });

  it('should reset ImportedData when input new config', () => {
    const initialState = initialConfigState;

    const config = configReducer(initialState, resetImportedData());

    expect(config).toEqual(initialConfigState);
  });

  it.each([
    ['projectName', { ...MockBasicState, projectName: '' }],
    ['startDate', { ...MockBasicState, dateRange: { startDate: '' } }],
    ['endDate', { ...MockBasicState, dateRange: { endDate: '' } }],
    ['metrics', { ...MockBasicState, metrics: [] }],
  ])('should show warning message when only %s empty', (_, payload) => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: false,
    };
    const action = {
      type: 'config/updateBasicConfigState',
      payload,
    };

    const config = configReducer(initialState, action);

    expect(config.warningMessage).toEqual(CONFIG_PAGE_VERIFY_IMPORT_ERROR_MESSAGE);
  });

  it('should return empty given steps not exists in pipelineList', () => {
    const store = setupStore();
    expect(selectSteps(store.getState(), 'mockOrgName', 'mockName')).toEqual([]);
  });

  it('should initial with first 6 ranges given imported ranges is more than 6', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: true,
    };
    const mockDateRange = [
      {
        startDate: '2024-01-15T00:00:00.000+08:00',
        endDate: '2024-01-16T00:00:00.000+08:00',
      },
      {
        startDate: '2024-01-17T00:00:00.000+08:00',
        endDate: '2024-01-18T00:00:00.000+08:00',
      },
      {
        startDate: '2024-01-20T00:00:00.000+08:00',
        endDate: '2024-01-21T00:00:00.000+08:00',
      },
      {
        startDate: '2024-01-22T00:00:00.000+08:00',
        endDate: '2024-01-24T00:00:00.000+08:00',
      },
      {
        startDate: '2024-02-01T00:00:00.000+08:00',
        endDate: '2024-02-03T00:00:00.000+08:00',
      },
      {
        startDate: '2024-02-10T00:00:00.000+08:00',
        endDate: '2024-02-15T00:00:00.000+08:00',
      },
      {
        startDate: '2024-03-15T00:00:00.000+08:00',
        endDate: '2024-03-16T00:00:00.000+08:00',
      },
    ];
    const action = {
      type: 'config/updateBasicConfigState',
      payload: {
        ...MockBasicState,
        dateRange: mockDateRange,
        sortType: SortType.DEFAULT,
      },
    };

    const config = configReducer(initialState, action);

    expect(config.basic.dateRange.length).toEqual(6);
  });

  it('should be compatible with old version date range', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: true,
    };
    const mockDateRange = {
      startDate: '2024-01-15T00:00:00.000+08:00',
      endDate: '2024-01-16T00:00:00.000+08:00',
    };
    const action = {
      type: 'config/updateBasicConfigState',
      payload: {
        ...MockBasicState,
        dateRange: mockDateRange,
      },
    };

    const config = configReducer(initialState, action);

    expect(config.basic.dateRange[0]).toEqual(mockDateRange);
  });

  it('should set warning message when imported sortType is invalid', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: false,
    };
    const mockDateRange = [
      {
        startDate: '2024-01-15T00:00:00.000+08:00',
        endDate: '2024-01-16T00:00:00.000+08:00',
      },
      {
        startDate: '2024-01-17T00:00:00.000+08:00',
        endDate: '2024-01-18T00:00:00.000+08:00',
      },
    ];
    const action = {
      type: 'config/updateBasicConfigState',
      payload: { ...MockBasicState, dateRange: mockDateRange, sortType: 'test' },
    };
    const config = configReducer(initialState, action);
    expect(config.warningMessage).toBe(CONFIG_PAGE_VERIFY_IMPORT_ERROR_MESSAGE);
  });

  it('should not set warning message when imported date ranges has length 1 and importedSortType is null', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: false,
    };
    const action = {
      type: 'config/updateBasicConfigState',
      payload: { ...MockBasicState, dateRange: [MockBasicState.dateRange[0]], sortType: null },
    };
    const config = configReducer(initialState, action);
    expect(config.warningMessage).toBe(null);
  });

  it('should set warning message when imported date ranges has length 1 and importedSortType is valid', () => {
    const initialState = {
      ...initialConfigState,
      isProjectCreated: false,
    };
    const action = {
      type: 'config/updateBasicConfigState',
      payload: { ...MockBasicState, dateRange: [MockBasicState.dateRange[0]], sortType: SortType.DEFAULT },
    };
    const config = configReducer(initialState, action);
    expect(config.warningMessage).toBe(null);
  });

  it('should update source control verified repo list', () => {
    const initialState = {
      ...initialConfigState,
    };
    const expectedSourceControlVerifiedRepoList = [
      { name: 'organization', value: 'mock-org1', children: [] },
      { name: 'organization', value: 'mock-org2', children: [] },
    ];
    const action = {
      type: 'config/updateSourceControlVerifiedResponse',
      payload: {
        parents: [],
        names: ['mock-org1', 'mock-org2'],
      },
    };

    const config = configReducer(initialState, action);

    expect(config.sourceControl.verifiedResponse.repoList.children).toEqual(expectedSourceControlVerifiedRepoList);
  });

  it('should update source control verified repo list when exist organization', () => {
    const initialState = {
      ...initialConfigState,
      sourceControl: {
        ...initialConfigState.sourceControl,
        verifiedResponse: {
          repoList: {
            children: [
              {
                name: 'organization',
                value: 'mock-org1',
                children: [],
              },
              {
                name: 'organization',
                value: 'mock-org2',
                children: [],
              },
            ],
            name: 'root',
            value: '-1',
          },
        },
      },
    };
    const expectedSourceControlVerifiedRepoList1 = [
      { name: 'organization', value: 'mock-org1', children: [] },
      { name: 'organization', value: 'mock-org2', children: [] },
    ];
    const expectedSourceControlVerifiedRepoList2 = [
      {
        name: 'organization',
        value: 'mock-org1',
        children: [
          { name: 'repo', value: 'mock-repo1', children: [] },
          { name: 'repo', value: 'mock-repo2', children: [] },
        ],
      },
      { name: 'organization', value: 'mock-org2', children: [] },
    ];
    const action = {
      type: 'config/updateSourceControlVerifiedResponse',
      payload: {
        parents: [],
        names: ['mock-org1', 'mock-org2'],
      },
    };
    const action2 = {
      type: 'config/updateSourceControlVerifiedResponse',
      payload: {
        parents: [
          {
            name: 'organization',
            value: 'mock-org1',
          },
        ],
        names: ['mock-repo1', 'mock-repo2'],
      },
    };

    const config = configReducer(initialState, action);
    const config2 = configReducer(config, action2);

    expect(config.sourceControl.verifiedResponse.repoList.children).toEqual(expectedSourceControlVerifiedRepoList1);
    expect(config2.sourceControl.verifiedResponse.repoList.children).toEqual(expectedSourceControlVerifiedRepoList2);
  });

  it('should clear source control verified repo list', () => {
    const initialState = {
      ...initialConfigState,
      sourceControl: {
        ...initialConfigState.sourceControl,
        verifiedResponse: {
          repoList: {
            children: [
              {
                name: 'organization',
                value: 'mock-org1',
                children: [],
              },
              {
                name: 'organization',
                value: 'mock-org2',
                children: [],
              },
            ],
            name: 'root',
            value: '-1',
          },
        },
      },
    };
    const expectedSourceControlVerifiedRepoList: string[] = [];
    const action = {
      type: 'config/clearSourceControlVerifiedResponse',
    };

    const config = configReducer(initialState, action);

    expect(config.sourceControl.verifiedResponse.repoList.children).toEqual(expectedSourceControlVerifiedRepoList);
  });
});

describe('select methods', () => {
  const store = setupStore();
  store.dispatch(
    updateSourceControlVerifiedResponse({
      parents: [],
      names: ['test-org1', 'test-org2'],
    }),
  );
  store.dispatch(
    updateSourceControlVerifiedResponse({
      parents: [
        {
          name: 'organization',
          value: 'test-org1',
        },
      ],
      names: ['test-repo1', 'test-repo2'],
    }),
  );
  store.dispatch(
    updateSourceControlVerifiedResponse({
      parents: [
        {
          name: 'organization',
          value: 'test-org1',
        },
        {
          name: 'repo',
          value: 'test-repo1',
        },
      ],
      names: ['test-branch1', 'test-branch2'],
    }),
  );
  store.dispatch(
    updateSourceControlVerifiedResponse({
      parents: [
        {
          name: 'organization',
          value: 'test-org1',
        },
        {
          name: 'repo',
          value: 'test-repo1',
        },
        {
          name: 'branch',
          value: 'test-branch1',
        },
      ],
      names: ['1-2', '1-3'],
    }),
  );
  store.dispatch(
    updateSourceControlVerifiedResponse({
      parents: [
        {
          name: 'organization',
          value: 'test-org1',
        },
        {
          name: 'repo',
          value: 'test-repo1',
        },
        {
          name: 'branch',
          value: 'test-branch1',
        },
        {
          name: 'time',
          value: '1-2',
        },
      ],
      names: ['test-crew1', 'test-crew2'],
    }),
  );

  it('should get all organizations when call selectSourceControlOrganizations function', () => {
    const organizations = selectSourceControlOrganizations(store.getState());
    expect(organizations).toEqual(['test-org1', 'test-org2']);
  });

  it('should get all repos when call selectSourceControlRepos function', () => {
    const repos = selectSourceControlRepos(store.getState(), 'test-org1');
    expect(repos).toEqual(['test-repo1', 'test-repo2']);
  });

  it('should get all branches when call selectSourceControlBranches function', () => {
    const branches = selectSourceControlBranches(store.getState(), 'test-org1', 'test-repo1');
    expect(branches).toEqual(['test-branch1', 'test-branch2']);
  });
  it('should get all crews when call selectSourceControlCrews function', () => {
    const crews = selectSourceControlCrews(store.getState(), 'test-org1', 'test-repo1', 'test-branch1', 1, 2);
    expect(crews).toEqual(['test-crew1', 'test-crew2']);
  });
});
