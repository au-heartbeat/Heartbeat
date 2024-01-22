import { render, waitFor, within } from '@testing-library/react';
import { setupStore } from '../../utils/setupStoreUtil';
import MetricsStep from '@src/containers/MetricsStep';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import {
  CLASSIFICATION_SETTING,
  CREWS_SETTING,
  CYCLE_TIME_SETTINGS,
  CYCLE_TIME_SETTINGS_SECTION,
  DEPLOYMENT_FREQUENCY_SETTINGS,
  LIST_OPEN,
  MOCK_BUILD_KITE_GET_INFO_RESPONSE,
  MOCK_JIRA_VERIFY_RESPONSE,
  MOCK_PIPELINE_GET_INFO_URL,
  REAL_DONE,
  REAL_DONE_SETTING_SECTION,
  REQUIRED_DATA_LIST,
  SELECT_CONSIDER_AS_DONE_MESSAGE,
} from '../../fixtures';
import { saveCycleTimeSettings, saveDoneColumn, setCycleTimeSettingsType } from '@src/context/Metrics/metricsSlice';
import { updateJiraVerifyResponse, updateMetrics } from '@src/context/config/configSlice';
import { closeAllNotifications } from '@src/context/notification/NotificationSlice';
import { CYCLE_TIME_SETTINGS_TYPES } from '@src/constants/resources';
import userEvent from '@testing-library/user-event';

jest.mock('@src/context/notification/NotificationSlice', () => ({
  ...jest.requireActual('@src/context/notification/NotificationSlice'),
  closeAllNotifications: jest.fn().mockReturnValue({ type: 'CLOSE_ALL_NOTIFICATIONS' }),
}));

let store = setupStore();
const server = setupServer(
  rest.post(MOCK_PIPELINE_GET_INFO_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify(MOCK_BUILD_KITE_GET_INFO_RESPONSE))),
  ),
);

beforeAll(() => server.listen());
afterAll(() => server.close());

const setup = () =>
  render(
    <Provider store={store}>
      <MetricsStep />
    </Provider>,
  );

describe('MetricsStep', () => {
  beforeEach(() => {
    store = setupStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render Crews when select velocity, and show Real done when have done column in Cycle time', async () => {
    store.dispatch(updateMetrics([REQUIRED_DATA_LIST[1]]));
    store.dispatch(
      saveCycleTimeSettings([
        { column: 'Testing', status: 'testing', value: 'Done' },
        { column: 'Testing', status: 'test', value: 'Done' },
      ]),
    );

    const { getByText, queryByText } = setup();

    expect(getByText(CREWS_SETTING)).toBeInTheDocument();
    expect(queryByText(CYCLE_TIME_SETTINGS)).not.toBeInTheDocument();
    expect(queryByText(CLASSIFICATION_SETTING)).not.toBeInTheDocument();
    expect(getByText(REAL_DONE)).toBeInTheDocument();
  });

  it('should not show Real done when only one value is done for cycle time', async () => {
    store.dispatch(updateMetrics([REQUIRED_DATA_LIST[1]]));
    store.dispatch(saveCycleTimeSettings([{ column: 'Testing', status: 'testing', value: 'Done' }]));

    const { getByText, queryByText } = setup();

    expect(getByText(CREWS_SETTING)).toBeInTheDocument();
    expect(queryByText(CYCLE_TIME_SETTINGS)).not.toBeInTheDocument();
    expect(queryByText(CLASSIFICATION_SETTING)).not.toBeInTheDocument();
    expect(queryByText(REAL_DONE)).not.toBeInTheDocument();
  });

  it('should show Cycle Time Settings when select cycle time in config page', async () => {
    await store.dispatch(updateMetrics([REQUIRED_DATA_LIST[2]]));
    const { getByText } = setup();

    expect(getByText(CYCLE_TIME_SETTINGS)).toBeInTheDocument();
  });

  it('should hide Real Done when no done column in cycleTime settings', async () => {
    await store.dispatch(saveCycleTimeSettings([{ column: 'Testing', status: 'testing', value: 'Block' }]));
    const { queryByText } = setup();

    expect(queryByText(REAL_DONE)).not.toBeInTheDocument();
  });

  it('should show Classification Setting when select classification in config page', async () => {
    await store.dispatch(updateMetrics([REQUIRED_DATA_LIST[3]]));
    const { getByText } = setup();

    expect(getByText(CLASSIFICATION_SETTING)).toBeInTheDocument();
  });

  it('should show DeploymentFrequencySettings component when select deployment frequency in config page', async () => {
    await store.dispatch(updateMetrics([REQUIRED_DATA_LIST[5]]));
    const { getByText } = setup();

    expect(getByText(DEPLOYMENT_FREQUENCY_SETTINGS)).toBeInTheDocument();
  });

  it('should call closeAllNotifications', async () => {
    setup();

    expect(closeAllNotifications).toHaveBeenCalledTimes(1);
  });

  describe('with pre-filled cycle time data', () => {
    beforeEach(() => {
      const cycleTimeSettingsWithTwoDoneValue = [
        {
          column: 'To Do',
          status: 'BACKLOG',
          value: 'To Do',
        },
        {
          column: 'To Do',
          status: 'TO DO',
          value: 'To Do',
        },
        {
          column: 'To Do',
          status: 'GOING TO DO',
          value: 'To Do',
        },
        {
          column: 'In Progress',
          status: 'IN PROGRESS',
          value: 'Done',
        },
        {
          column: 'In Progress',
          status: 'IN DEV',
          value: 'Done',
        },
        {
          column: 'Block',
          status: 'BLOCK',
          value: 'Block',
        },
        {
          column: 'Test',
          status: 'TESTING',
          value: 'To do',
        },
        {
          column: 'Test',
          status: 'TO BE TESTED',
          value: 'To do',
        },
        {
          column: 'Done',
          status: 'PRE-DONE,',
          value: 'Done',
        },
        {
          column: 'Done',
          status: 'DONE',
          value: 'Done',
        },
        {
          column: 'Done',
          status: 'CANCEL',
          value: 'Done',
        },
      ];
      const doneColumn = ['IN PROGRESS', 'IN DEV', 'PRE-DONE', 'DONE', 'CANCEL'];
      const jiraColumns = [
        { key: 'indeterminate', value: { name: 'To Do', statuses: ['BACKLOG', 'TO DO', 'GOING TO DO'] } },
        { key: 'indeterminate', value: { name: 'In Progress', statuses: ['IN PROGRESS', 'IN DEV'] } },
        { key: 'indeterminate', value: { name: 'Block', statuses: ['BLOCK'] } },
        { key: 'indeterminate', value: { name: 'Test', statuses: ['TESTING', 'TO BE TESTED'] } },
        { key: 'done', value: { name: 'Done', statuses: ['PRE-DONE,', 'DONE', 'CANCEL'] } },
      ];

      store.dispatch(updateMetrics(REQUIRED_DATA_LIST));
      store.dispatch(saveCycleTimeSettings(cycleTimeSettingsWithTwoDoneValue));
      store.dispatch(saveDoneColumn(doneColumn));
      store.dispatch(
        updateJiraVerifyResponse({
          jiraColumns,
          users: MOCK_JIRA_VERIFY_RESPONSE.users,
        }),
      );
    });

    it('should reset real done when change Cycle time settings DONE to other status', async () => {
      const { getByLabelText, getByRole } = setup();
      const realDoneSettingSection = getByLabelText(REAL_DONE_SETTING_SECTION);

      expect(realDoneSettingSection).not.toHaveTextContent(SELECT_CONSIDER_AS_DONE_MESSAGE);
      const doneSelectTrigger = within(getByLabelText('Cycle time select for Done')).getByRole('combobox');

      await userEvent.click(doneSelectTrigger as HTMLInputElement);

      const noneOption = within(getByRole('presentation')).getByText('----');
      await userEvent.click(noneOption);

      expect(realDoneSettingSection).toHaveTextContent(SELECT_CONSIDER_AS_DONE_MESSAGE);
    });

    it('should reset real done when change Cycle time settings other status to DONE', async () => {
      const { getByLabelText, getByRole } = setup();
      const cycleTimeSettingsSection = getByLabelText(CYCLE_TIME_SETTINGS_SECTION);
      const realDoneSettingSection = getByLabelText(REAL_DONE_SETTING_SECTION);

      expect(realDoneSettingSection).not.toHaveTextContent(SELECT_CONSIDER_AS_DONE_MESSAGE);
      const columnsArray = within(cycleTimeSettingsSection).getAllByRole('button', { name: LIST_OPEN });

      await userEvent.click(columnsArray[2]);
      const options = within(getByRole('listbox')).getAllByRole('option');
      await userEvent.click(options[options.length - 1]);

      await waitFor(() => expect(realDoneSettingSection).toHaveTextContent(SELECT_CONSIDER_AS_DONE_MESSAGE));
    });

    it('should hide real done when change all Cycle time settings to other status', async () => {
      const { getByLabelText, getByRole } = setup();
      const cycleTimeSettingsSection = getByLabelText(CYCLE_TIME_SETTINGS_SECTION);
      const realDoneSettingSection = getByLabelText(REAL_DONE_SETTING_SECTION);

      expect(realDoneSettingSection).not.toHaveTextContent(SELECT_CONSIDER_AS_DONE_MESSAGE);
      const columnsArray = within(cycleTimeSettingsSection).getAllByRole('button', { name: LIST_OPEN });

      await userEvent.click(columnsArray[1]);

      const options1 = within(getByRole('listbox')).getAllByRole('option');
      await userEvent.click(options1[1]);

      await userEvent.click(columnsArray[4]);

      const options2 = within(getByRole('listbox')).getAllByRole('option');
      await userEvent.click(options2[1]);

      await waitFor(() => expect(realDoneSettingSection).not.toBeInTheDocument());
    });

    it('should hide Real Done when cycleTime settings type is by status', async () => {
      await store.dispatch(setCycleTimeSettingsType(CYCLE_TIME_SETTINGS_TYPES.BY_STATUS));
      const { queryByText } = setup();

      expect(queryByText(REAL_DONE)).not.toBeInTheDocument();
    });
  });
});
