// TODO: refactor case, replace fireEvent use userEvent. @Kai Zhou
import {
  ConfigTitle,
  DEPLOYMENT_FREQUENCY,
  ERROR_MESSAGE_TIME_DURATION,
  FAKE_PIPELINE_TOKEN,
  MOCK_BOARD_URL_FOR_JIRA,
  MOCK_PIPELINE_VERIFY_URL,
  PROJECT_NAME_LABEL,
  REQUIRED_DATA,
  RESET,
  TEST_PROJECT_NAME,
  VELOCITY,
  VERIFIED,
  VERIFY,
  ALL,
  PIPELINE_TOOL_TOKEN_INPUT_LABEL,
  REGULAR_CALENDAR,
  CHINA_CALENDAR,
  VIETNAM_CALENDAR,
  TIMEOUT_ALERT,
  LEAD_TIME_FOR_CHANGES,
  PIPELINE_TOOL_TYPES,
} from '../../fixtures';
import {
  basicInfoSchema,
  boardConfigSchema,
  pipelineToolSchema,
  sourceControlSchema,
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';
import {
  basicInfoDefaultValues,
  boardConfigDefaultValues,
  pipelineToolDefaultValues,
  sourceControlDefaultValues,
} from '@src/containers/ConfigStep/Form/useDefaultValues';
import { fillSourceControlFieldsInformation } from '@test/containers/ConfigStep/SourceControl.test';
import { fillPipelineToolFieldsInformation } from '@test/containers/ConfigStep/PipelineTool.test';
import { AxiosRequestErrorCode, PIPELINE_TOOL_OTHER_OPTION } from '@src/constants/resources';
import { fillBoardFieldsInformation } from '@test/containers/ConfigStep/Board.test';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { boardClient } from '@src/clients/board/BoardClient';
import { saveVersion } from '@src/context/meta/metaSlice';
import { setupStore } from '../../utils/setupStoreUtil';
import { TimeoutError } from '@src/errors/TimeoutError';
import { yupResolver } from '@hookform/resolvers/yup';
import userEvent from '@testing-library/user-event';
import ConfigStep from '@src/containers/ConfigStep';
import { closeMuiModal } from '@test/testUtils';
import { useForm } from 'react-hook-form';
import { HttpResponse, http } from 'msw';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';
import dayjs from 'dayjs';

const server = setupServer(
  http.post(MOCK_PIPELINE_VERIFY_URL, () => {
    return new HttpResponse(null, {
      status: HttpStatusCode.NoContent,
    });
  }),
  http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
    return new HttpResponse(
      JSON.stringify({
        projectKey: 'FAKE',
      }),
      {
        status: HttpStatusCode.Ok,
      },
    );
  }),
);

let store = null;
jest.mock('@src/context/config/configSlice', () => ({
  ...jest.requireActual('@src/context/config/configSlice'),
  selectWarningMessage: jest.fn().mockReturnValue('Test warning Message'),
}));

const ConfigStepWithFormInstances = () => {
  const basicInfoMethods = useForm<IBasicInfoData>({
    defaultValues: basicInfoDefaultValues,
    resolver: yupResolver(basicInfoSchema),
    mode: 'onChange',
  });

  const boardConfigMethods = useForm<IBoardConfigData>({
    defaultValues: boardConfigDefaultValues,
    resolver: yupResolver(boardConfigSchema),
    mode: 'onChange',
  });

  const pipelineToolMethods = useForm<IPipelineToolData>({
    defaultValues: pipelineToolDefaultValues,
    resolver: yupResolver(pipelineToolSchema),
    mode: 'onChange',
  });

  const sourceControlMethods = useForm<ISourceControlData>({
    defaultValues: sourceControlDefaultValues,
    resolver: yupResolver(sourceControlSchema),
    mode: 'onChange',
  });
  return (
    <ConfigStep
      basicInfoMethods={basicInfoMethods}
      boardConfigMethods={boardConfigMethods}
      pipelineToolMethods={pipelineToolMethods}
      sourceControlMethods={sourceControlMethods}
    />
  );
};

describe('ConfigStep', () => {
  const setup = (version: string = '1.2.1') => {
    store = setupStore();
    store.dispatch(saveVersion(version));
    return render(
      <Provider store={store}>
        <ConfigStepWithFormInstances />
      </Provider>,
    );
  };

  beforeAll(() => server.listen());

  afterEach(() => {
    store = null;
    jest.clearAllMocks();
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
    const vietnamCalendar = screen.getByRole('radio', { name: VIETNAM_CALENDAR });
    expect(defaultValue).toBeChecked();
    expect(chinaCalendar).not.toBeChecked();
    expect(vietnamCalendar).not.toBeChecked();
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

  it('should select Vietnam holiday when Regular calendar is default', async () => {
    setup();

    const vietnamCalendar = screen.getByRole('radio', { name: VIETNAM_CALENDAR });
    const regularCalendar = screen.getByRole('radio', { name: REGULAR_CALENDAR });
    await userEvent.click(vietnamCalendar);

    await waitFor(() => {
      expect(vietnamCalendar).toBeChecked();
    });
    expect(regularCalendar).not.toBeChecked();

    await userEvent.click(regularCalendar);

    await waitFor(() => {
      expect(regularCalendar).toBeChecked();
    });
    expect(vietnamCalendar).not.toBeChecked();
  });

  it('should not show board component when init ConfigStep component ', async () => {
    setup();

    await waitFor(() => {
      expect(screen.queryByText(ConfigTitle.Board)).toBeNull();
    });
  });

  it('should show board component when MetricsTypeCheckbox select Velocity,Cycle time', async () => {
    setup();

    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: /velocity/i }));
    await userEvent.click(requireDateSelection.getByRole('option', { name: /cycle time/i }));

    await waitFor(() => {
      expect(screen.getAllByText(ConfigTitle.Board)[0]).toBeInTheDocument();
    });
  });

  it('should show board component when MetricsTypeCheckbox select  Classification, ', async () => {
    setup();

    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: 'Classification' }));

    await waitFor(() => {
      expect(screen.getAllByText(ConfigTitle.Board)[0]).toBeInTheDocument();
    });
  });

  it('should show warning message when selectWarningMessage has a value', async () => {
    setup();

    expect(screen.getByText('Test warning Message')).toBeVisible();
  });

  it('should show disable warning message When selectWarningMessage has a value after two seconds', async () => {
    jest.useFakeTimers();
    setup();

    act(() => {
      jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test warning Message')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should no need verify again when date picker is changed given board fields are filled and verified', async () => {
    const today = dayjs().format('MM/DD/YYYY');
    setup();

    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));
    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: VELOCITY }));
    await closeMuiModal(userEvent);
    await fillBoardFieldsInformation();
    await userEvent.click(screen.getByText(VERIFY));
    const startDateInput = screen.getByLabelText('From *');
    await userEvent.type(startDateInput, today);

    await waitFor(() => {
      expect(screen.queryByText(VERIFY)).toBeNull();
    });
    expect(screen.queryByText(VERIFIED)).toBeVisible();
    expect(screen.queryByText(RESET)).toBeVisible();
  });

  it('should no need verify again when collection-date or date-picker is changed given pipeline token is filled and verified', async () => {
    const today = dayjs().format('MM/DD/YYYY');
    setup();

    const requiredMetricsField = screen.getByRole('combobox', { name: REQUIRED_DATA });
    await userEvent.click(requiredMetricsField);
    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: DEPLOYMENT_FREQUENCY }));
    await closeMuiModal(userEvent);
    const tokenNode = within(screen.getByTestId('pipelineToolTextField')).getByLabelText(
      PIPELINE_TOOL_TOKEN_INPUT_LABEL,
    );
    await userEvent.type(tokenNode, FAKE_PIPELINE_TOKEN);
    const submitButton = screen.getByText(VERIFY);
    await userEvent.click(submitButton);
    const startDateInput = screen.getByLabelText('From *');
    await userEvent.type(startDateInput, today);

    await waitFor(() => {
      expect(screen.queryByText(VERIFY)).toBeNull();
    });
    expect(screen.queryByText(VERIFIED)).toBeVisible();
    expect(screen.queryByText(RESET)).toBeVisible();
  });

  it('should show all forms given all metrics selected', async () => {
    setup();

    const requiredMetricsField = screen.getByRole('combobox', { name: REQUIRED_DATA });
    await userEvent.click(requiredMetricsField);
    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: ALL }));
    await closeMuiModal(userEvent);

    expect(screen.getByLabelText('Board Config')).toBeInTheDocument();
    expect(screen.getByLabelText('Pipeline Tool Config')).toBeInTheDocument();
    expect(screen.getByLabelText('Source Control Config')).toBeInTheDocument();
  });

  it('should show reset dialog when click reset button and click cancel button dont reset and click confirm will reset', async () => {
    setup();

    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));
    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: ALL }));
    await closeMuiModal(userEvent);
    await fillBoardFieldsInformation();
    await fillPipelineToolFieldsInformation();
    await fillSourceControlFieldsInformation();
    const boardTokenInput = within(screen.getByLabelText('Board Config')).getByLabelText(/token/i) as HTMLInputElement;
    const boardIdInput = screen.getByLabelText(/board id/i) as HTMLInputElement;
    const boardEmailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const boardSiteInput = screen.getByLabelText(/site/i) as HTMLInputElement;
    const pipelineTokenInput = within(screen.getByTestId('pipelineToolTextField')).getByLabelText(
      PIPELINE_TOOL_TOKEN_INPUT_LABEL,
    ) as HTMLInputElement;
    const sourceControlTokenInput = screen
      .getByTestId('sourceControlTextField')
      .querySelector('input') as HTMLInputElement;

    await waitFor(() => {
      expect(within(screen.getByLabelText('Board Config')).getByRole('button', { name: /verify/i })).not.toBeDisabled();
      expect(
        within(screen.getByLabelText('Pipeline Tool Config')).getByRole('button', { name: /verify/i }),
      ).not.toBeDisabled();
      expect(
        within(screen.getByLabelText('Source Control Config')).getByRole('button', { name: /verify/i }),
      ).not.toBeDisabled();
    });

    await userEvent.click(within(screen.getByLabelText('Board Config')).getByText(/verify/i));
    await userEvent.click(within(screen.getByLabelText('Pipeline Tool Config')).getByText(/verify/i));
    await userEvent.click(within(screen.getByLabelText('Source Control Config')).getByText(/verify/i));

    await waitFor(() => {
      expect(within(screen.getByLabelText('Board Config')).getByRole('button', { name: /reset/i })).toBeInTheDocument();
      expect(
        within(screen.getByLabelText('Pipeline Tool Config')).getByRole('button', { name: /reset/i }),
      ).toBeInTheDocument();
      expect(
        within(screen.getByLabelText('Source Control Config')).getByRole('button', { name: /reset/i }),
      ).toBeInTheDocument();
    });

    await userEvent.click(within(screen.getByLabelText('Board Config')).getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(screen.queryByLabelText('reset confirm dialog')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog title')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog close')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog content')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog cancel button')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog confirm button')).toBeInTheDocument();

      expect(boardIdInput.value).not.toEqual('');
      expect(boardEmailInput.value).not.toEqual('');
      expect(boardSiteInput.value).not.toEqual('');
      expect(boardTokenInput.value).not.toEqual('');
      expect(pipelineTokenInput.value).not.toEqual('');
      expect(sourceControlTokenInput.value).not.toEqual('');
    });

    await userEvent.click(screen.getByLabelText('reset confirm dialog cancel button'));

    await waitFor(() => {
      expect(screen.queryByLabelText('reset confirm dialog')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog title')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog close')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog content')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog cancel button')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog confirm button')).not.toBeInTheDocument();

      expect(boardIdInput.value).not.toEqual('');
      expect(boardEmailInput.value).not.toEqual('');
      expect(boardSiteInput.value).not.toEqual('');
      expect(boardTokenInput.value).not.toEqual('');
      expect(pipelineTokenInput.value).not.toEqual('');
      expect(sourceControlTokenInput.value).not.toEqual('');
    });

    await userEvent.click(
      within(screen.getByLabelText('Pipeline Tool Config')).getByRole('button', { name: /reset/i }),
    );

    await waitFor(() => {
      expect(screen.queryByLabelText('reset confirm dialog')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog title')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog close')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog content')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog cancel button')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog confirm button')).toBeInTheDocument();

      expect(boardIdInput.value).not.toEqual('');
      expect(boardEmailInput.value).not.toEqual('');
      expect(boardSiteInput.value).not.toEqual('');
      expect(boardTokenInput.value).not.toEqual('');
      expect(pipelineTokenInput.value).not.toEqual('');
      expect(sourceControlTokenInput.value).not.toEqual('');
    });

    await userEvent.click(screen.getByLabelText('reset confirm dialog close'));

    await waitFor(() => {
      expect(screen.queryByLabelText('reset confirm dialog')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog title')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog close')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog content')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog cancel button')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog confirm button')).not.toBeInTheDocument();

      expect(boardIdInput.value).not.toEqual('');
      expect(boardEmailInput.value).not.toEqual('');
      expect(boardSiteInput.value).not.toEqual('');
      expect(boardTokenInput.value).not.toEqual('');
      expect(pipelineTokenInput.value).not.toEqual('');
      expect(sourceControlTokenInput.value).not.toEqual('');
    });

    await userEvent.click(
      within(screen.getByLabelText('Source Control Config')).getByRole('button', { name: /reset/i }),
    );

    await waitFor(() => {
      expect(screen.queryByLabelText('reset confirm dialog')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog title')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog close')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog content')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog cancel button')).toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog confirm button')).toBeInTheDocument();

      expect(boardIdInput.value).not.toEqual('');
      expect(boardEmailInput.value).not.toEqual('');
      expect(boardSiteInput.value).not.toEqual('');
      expect(boardTokenInput.value).not.toEqual('');
      expect(pipelineTokenInput.value).not.toEqual('');
      expect(sourceControlTokenInput.value).not.toEqual('');
    });
    await userEvent.click(screen.getByLabelText('reset confirm dialog confirm button'));

    await waitFor(() => {
      expect(screen.queryByLabelText('reset confirm dialog')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog title')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog close')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog content')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog cancel button')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('reset confirm dialog confirm button')).not.toBeInTheDocument();

      expect(boardIdInput.value).not.toEqual('');
      expect(boardEmailInput.value).not.toEqual('');
      expect(boardSiteInput.value).not.toEqual('');
      expect(boardTokenInput.value).not.toEqual('');
      expect(pipelineTokenInput.value).not.toEqual('');
      expect(sourceControlTokenInput.value).toEqual('');
    });
  });

  it('should hidden timeout alert when click reset button and click confirm button', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));
    const requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: VELOCITY }));
    await closeMuiModal(userEvent);
    await fillBoardFieldsInformation();

    const mockedError = new TimeoutError('', AxiosRequestErrorCode.Timeout);
    boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));

    await userEvent.click(screen.getByText(VERIFY));

    expect(screen.getByLabelText(TIMEOUT_ALERT)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: RESET }));
    await userEvent.click(screen.getByLabelText('reset confirm dialog confirm button'));

    expect(screen.queryByLabelText(TIMEOUT_ALERT)).not.toBeInTheDocument();
  });

  it('should switch to buildKite when add a new dora metrics after pipeline tool is none', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));
    let requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: LEAD_TIME_FOR_CHANGES }));
    await closeMuiModal(userEvent);

    await userEvent.click(screen.getByRole('combobox', { name: 'Pipeline Tool' }));
    let listBox = within(screen.getByRole('listbox'));
    let options = listBox.getAllByRole('option');

    expect(options.length).toEqual(2);

    const buildKiteOption = options[0];
    const noneOption = options[1];

    expect(buildKiteOption.getAttribute('data-value')).toEqual(PIPELINE_TOOL_TYPES.BUILD_KITE);
    expect(noneOption.getAttribute('data-value')).toEqual(PIPELINE_TOOL_OTHER_OPTION);

    await userEvent.click(noneOption);
    await userEvent.click(screen.getByRole('combobox', { name: REQUIRED_DATA }));
    requireDateSelection = within(screen.getByRole('listbox'));
    await userEvent.click(requireDateSelection.getByRole('option', { name: DEPLOYMENT_FREQUENCY }));
    await closeMuiModal(userEvent);
    await userEvent.click(screen.getByRole('combobox', { name: 'Pipeline Tool' }));
    listBox = within(screen.getByRole('listbox'));
    options = listBox.getAllByRole('option');

    expect(options.length).toEqual(1);
    expect(options[0].getAttribute('data-value')).toEqual(PIPELINE_TOOL_TYPES.BUILD_KITE);

    const tokenInput = within(screen.getByTestId('pipelineToolTextField')).getByLabelText(
      PIPELINE_TOOL_TOKEN_INPUT_LABEL,
    ) as HTMLInputElement;

    await waitFor(() => {
      expect(within(screen.getByLabelText('Pipeline Tool Config')).getByText('Verify')).toBeDisabled();
      expect(tokenInput).toBeInTheDocument();
      expect(tokenInput.value).toEqual('');
    });
  });
});
