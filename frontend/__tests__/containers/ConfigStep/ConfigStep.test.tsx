// TODO: refactor case, replace fireEvent use userEvent. @Kai Zhou
import {
  CHINA_CALENDAR,
  CONFIG_TITLE,
  CYCLE_TIME,
  DEPLOYMENT_FREQUENCY,
  ERROR_MESSAGE_TIME_DURATION,
  FAKE_TOKEN,
  MOCK_BOARD_URL_FOR_JIRA,
  MOCK_PIPELINE_VERIFY_URL,
  PROJECT_NAME_LABEL,
  REGULAR_CALENDAR,
  REQUIRED_DATA,
  RESET,
  TEST_PROJECT_NAME,
  VELOCITY,
  VERIFIED,
  VERIFY,
} from '../../fixtures';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { setupStore } from '../../utils/setupStoreUtil';
import ConfigStep from '@src/containers/ConfigStep';
import ue from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import dayjs from 'dayjs';

const userEvent = ue.setup({
  advanceTimers: jest.advanceTimersByTime,
});

const fillBoardFieldsInformation = async () => {
  await userEvent.type(screen.getByLabelText(/board id/i), '1');
  await userEvent.type(screen.getByLabelText(/email/i), 'fake@qq.com');
  await userEvent.type(screen.getByLabelText(/site/i), 'fake');
  await userEvent.type(screen.getByLabelText(/token/i), FAKE_TOKEN);
};

const server = setupServer(
  rest.post(MOCK_PIPELINE_VERIFY_URL, (_, res, ctx) => res(ctx.status(204))),
  rest.post(MOCK_BOARD_URL_FOR_JIRA, (_, res, ctx) => res(ctx.status(200))),
);

let store = null;
jest.mock('@src/context/config/configSlice', () => ({
  ...jest.requireActual('@src/context/config/configSlice'),
  selectWarningMessage: jest.fn().mockReturnValue('Test warning Message'),
}));
describe('ConfigStep', () => {
  const setup = () => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <ConfigStep />
      </Provider>,
    );
  };

  beforeAll(() => server.listen());

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    store = null;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => server.close());

  it('should show project name when render configStep', () => {
    setup();

    expect(screen.getByText(PROJECT_NAME_LABEL)).toBeInTheDocument();
  });

  it('should show project name when input some letters', async () => {
    setup();

    const input = screen.getByRole('textbox', { name: PROJECT_NAME_LABEL });
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });

    await userEvent.type(input, TEST_PROJECT_NAME);

    await waitFor(() => {
      expect(input).toHaveValue(TEST_PROJECT_NAME);
    });
  });

  it('should show error message when project name is Empty', async () => {
    setup();

    const input = screen.getByRole('textbox', { name: PROJECT_NAME_LABEL });
    await userEvent.type(input, TEST_PROJECT_NAME);

    await waitFor(() => {
      expect(input).toHaveValue(TEST_PROJECT_NAME);
    });

    await userEvent.clear(input);

    await waitFor(() => {
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
    });
  });

  it('should show error message when click project name input with no letter', async () => {
    setup();
    const input = screen.getByRole('textbox', { name: PROJECT_NAME_LABEL });

    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('should select Regular calendar by default when rendering the radioGroup', () => {
    setup();

    const defaultValue = screen.getByRole('radio', { name: REGULAR_CALENDAR });
    const chinaCalendar = screen.getByRole('radio', { name: CHINA_CALENDAR });
    expect(defaultValue).toBeChecked();
    expect(chinaCalendar).not.toBeChecked();
  });

  it('should switch the radio when any radioLabel is selected', async () => {
    setup();

    const chinaCalendar = screen.getByRole('radio', { name: CHINA_CALENDAR });
    const regularCalendar = screen.getByRole('radio', { name: REGULAR_CALENDAR });
    await userEvent.click(chinaCalendar);

    await waitFor(() => {
      expect(chinaCalendar).toBeChecked();
    });
    expect(regularCalendar).not.toBeChecked();

    await userEvent.click(regularCalendar);

    await waitFor(() => {
      expect(regularCalendar).toBeChecked();
    });
    expect(chinaCalendar).not.toBeChecked();
  });

  it('should not show board component when init ConfigStep component ', async () => {
    setup();

    await waitFor(() => {
      expect(screen.queryByText(CONFIG_TITLE.BOARD)).toBeNull();
    });
  });

  it('should show board component when MetricsTypeCheckbox select Velocity,Cycle time', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: REQUIRED_DATA }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: /velocity/i }));
    await userEvent.click(requireDateSelection.getByRole('option', { name: /cycle time/i }));

    await waitFor(() => {
      expect(screen.getAllByText(CONFIG_TITLE.BOARD)[0]).toBeInTheDocument();
    });
  });

  it('should show board component when MetricsTypeCheckbox select  Classification, ', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: REQUIRED_DATA }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: 'Classification' }));

    await waitFor(() => {
      expect(screen.getAllByText(CONFIG_TITLE.BOARD)[0]).toBeInTheDocument();
    });
  });

  it.skip('should no need verify again when calendar type is changed given board fields are filled and verified', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: REQUIRED_DATA }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: VELOCITY }));

    await waitFor(() => {
      expect(screen.getByLabelText(/board id/i)).toBeInTheDocument();
    });

    await fillBoardFieldsInformation();
    await userEvent.click(screen.getByText(VERIFY));
    await userEvent.click(screen.getByText(CHINA_CALENDAR));

    await waitFor(() => {
      expect(screen.getByText(/verify/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(RESET)).toBeNull();
  });

  it('should no need verify again when date picker is changed given board fields are filled and verified', async () => {
    const today = dayjs().format('MM/DD/YYYY');
    setup();

    await userEvent.click(screen.getByRole('button', { name: REQUIRED_DATA }));
    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: VELOCITY }));

    await fillBoardFieldsInformation();
    await userEvent.click(screen.getByText(VERIFY));

    const startDateInput = screen.getByLabelText('From *');
    await userEvent.type(startDateInput, today);

    await waitFor(() => {
      expect(screen.getByText(VERIFIED)).toBeInTheDocument();
    });
  });

  it('should show warning message when selectWarningMessage has a value', async () => {
    setup();

    expect(screen.getByText('Test warning Message')).toBeVisible();
  });

  it('should show disable warning message When selectWarningMessage has a value after two seconds', async () => {
    setup();

    act(() => {
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test warning Message')).not.toBeInTheDocument();
    });
  });

  it.skip('should not verify again when collection-date or date-picker is changed given pipeline token is filled and verified', async () => {
    const wrapper = setup();
    const mockToken = 'bkua_mockTokenMockTokenMockTokenMockToken1234';
    const today = dayjs().format('MM/DD/YYYY');
    const startDateInput = wrapper.getByLabelText('From *');

    const requiredMetricsField = wrapper.getByRole('button', { name: REQUIRED_DATA });
    await userEvent.click(requiredMetricsField);
    const requireDateSelection = within(wrapper.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: DEPLOYMENT_FREQUENCY }));

    const tokenNode = within(wrapper.getByTestId('pipelineToolTextField')).getByLabelText('input Token');

    await userEvent.type(tokenNode, mockToken);

    const submitButton = wrapper.getByText(VERIFY);
    await userEvent.click(submitButton);

    await userEvent.type(startDateInput, today);

    await waitFor(() => {
      expect(wrapper.queryByText(VERIFY)).toBeNull();
    });
    expect(wrapper.queryByText('Verified')).toBeVisible();
    expect(wrapper.queryByText(RESET)).toBeVisible();
  });
});
