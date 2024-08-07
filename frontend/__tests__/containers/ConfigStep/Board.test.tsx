import {
  BOARD_FIELDS,
  BOARD_TYPES,
  ConfigTitle,
  ERROR_MESSAGE_COLOR,
  MOCK_BOARD_URL_FOR_JIRA,
  RESET,
  VERIFIED,
  VERIFY,
  FAKE_TOKEN,
  REVERIFY,
  BOARD_VERIFY_ALERT,
  TIMEOUT_ALERT,
} from '../../fixtures';
import { boardConfigDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { boardConfigSchema } from '@src/containers/ConfigStep/Form/schema';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UnauthorizedError } from '@src/errors/UnauthorizedError';
import { AxiosRequestErrorCode } from '@src/constants/resources';
import { boardClient } from '@src/clients/board/BoardClient';
import { Board } from '@src/containers/ConfigStep/Board';
import { setupStore } from '../../utils/setupStoreUtil';
import { FormProvider } from '@test/utils/FormProvider';
import { TimeoutError } from '@src/errors/TimeoutError';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http, delay } from 'msw';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';

export const fillBoardFieldsInformation = async () => {
  const boardIdInput = screen.getByLabelText(/board id/i) as HTMLInputElement;
  const boardIdInputValue = '1';
  await userEvent.type(boardIdInput, boardIdInputValue);
  expect(boardIdInput.value).toEqual(boardIdInputValue);

  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
  const emailInputValue = 'fake@qq.com';
  await userEvent.type(emailInput, emailInputValue);
  expect(emailInput.value).toEqual(emailInputValue);

  const siteInput = screen.getByLabelText(/site/i) as HTMLInputElement;
  const siteInputValue = 'fake';
  await userEvent.type(siteInput, siteInputValue);
  expect(siteInput.value).toEqual(siteInputValue);

  const tokenInput = within(screen.getByLabelText('Board Config')).getByLabelText(/token/i) as HTMLInputElement;
  const tokenInputValue = FAKE_TOKEN;
  await userEvent.type(tokenInput, tokenInputValue);
  expect(tokenInput.value).toEqual(tokenInputValue);
};

let store = null;

const server = setupServer();

const mockVerifySuccess = (delayValue = 0) => {
  server.use(
    http.post(MOCK_BOARD_URL_FOR_JIRA, async () => {
      await delay(delayValue);
      return new HttpResponse(
        JSON.stringify({
          projectKey: 'FAKE',
        }),
      );
    }),
  );
};

const originalGetVerifyBoard = boardClient.getVerifyBoard;

describe('Board', () => {
  beforeAll(() => {
    server.listen();
  });
  afterAll(() => server.close());

  const onReset = jest.fn();
  const onSetResetFields = jest.fn();
  store = setupStore();
  const setup = () => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <FormProvider schema={boardConfigSchema} defaultValues={boardConfigDefaultValues}>
          <Board onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      </Provider>,
    );
  };

  afterEach(() => {
    store = null;
    boardClient.getVerifyBoard = originalGetVerifyBoard;
  });

  it('should show board title and fields when render board component ', () => {
    setup();
    BOARD_FIELDS.map((field) => {
      expect(screen.getByLabelText(`${field} *`)).toBeInTheDocument();
    });
    expect(screen.getAllByText(ConfigTitle.Board)[0]).toBeInTheDocument();
  });

  it('should show default value jira when init board component', () => {
    setup();
    const boardType = screen.getByRole('combobox', {
      name: /board/i,
    });

    expect(boardType).toBeInTheDocument();
  });

  it('should show detail options when click board field', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox', { name: ConfigTitle.Board }));
    const listBox = within(screen.getByRole('listbox'));
    const options = listBox.getAllByRole('option');
    const optionValue = options.map((li) => li.getAttribute('data-value'));

    expect(optionValue).toEqual(Object.values(BOARD_TYPES));
  });

  it('should show board type when select board field value ', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox', { name: ConfigTitle.Board }));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /jira/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('option', { name: /jira/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', {
          name: /board/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it('should show error message when input a wrong type or empty email ', async () => {
    setup();
    const EMAil_INVALID_ERROR_MESSAGE = 'Email is invalid!';
    const emailInput = screen.getByRole('textbox', {
      name: /email/i,
    });

    await userEvent.type(emailInput, 'wrong@email');

    await waitFor(() => {
      expect(screen.getByText(EMAil_INVALID_ERROR_MESSAGE)).toBeVisible();
    });

    expect(screen.getByText(EMAil_INVALID_ERROR_MESSAGE)).toHaveStyle(ERROR_MESSAGE_COLOR);

    await userEvent.clear(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Email is required!')).toBeVisible();
    });
  });

  it('should run the reset and setResetField func when click reset button', async () => {
    setup();
    mockVerifySuccess();
    await fillBoardFieldsInformation();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify/i })).not.toBeDisabled();
    });

    await userEvent.click(screen.getByText(/verify/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /verified/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSetResetFields).toHaveBeenCalledTimes(1);
  });

  it('should hidden timeout alert when the error type of api call becomes other', async () => {
    const { getByLabelText, queryByLabelText } = setup();
    await fillBoardFieldsInformation();
    const timeoutError = new TimeoutError('', AxiosRequestErrorCode.Timeout);
    boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(timeoutError));

    await userEvent.click(screen.getByText(VERIFY));

    expect(getByLabelText(TIMEOUT_ALERT)).toBeInTheDocument();

    const mockedError = new TimeoutError('', HttpStatusCode.Unauthorized);
    boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));

    await userEvent.click(screen.getByText(REVERIFY));

    expect(queryByLabelText(TIMEOUT_ALERT)).not.toBeInTheDocument();
  });

  describe('Board verify alert', () => {
    beforeEach(() => {
      const mockedError = new UnauthorizedError('', HttpStatusCode.Unauthorized, '');
      boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));
    });

    it('should show board verify alert given board verify unauthorized', async () => {
      const { getByLabelText } = setup();
      await fillBoardFieldsInformation();
      const mockedError = new UnauthorizedError('', HttpStatusCode.Unauthorized, '');
      boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));

      await userEvent.click(screen.getByText(VERIFY));

      expect(getByLabelText(BOARD_VERIFY_ALERT)).toBeInTheDocument();
    });

    it('should close board verify alert when user manually close the alert', async () => {
      setup();
      await fillBoardFieldsInformation();
      const mockedError = new UnauthorizedError('', HttpStatusCode.Unauthorized, '');
      boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));

      await userEvent.click(screen.getByText(VERIFY));

      expect(screen.getByLabelText(BOARD_VERIFY_ALERT)).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText('Close'));

      expect(screen.queryByLabelText(BOARD_VERIFY_ALERT)).not.toBeInTheDocument();
    });

    it('should still show board verify alert when user only change email input', async () => {
      setup();
      await fillBoardFieldsInformation();
      const mockedError = new UnauthorizedError('', HttpStatusCode.Unauthorized, '');
      boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));

      await userEvent.click(screen.getByText(VERIFY));

      expect(screen.getByLabelText(BOARD_VERIFY_ALERT)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/email/i), 'fake@qq.com');

      expect(screen.queryByLabelText(BOARD_VERIFY_ALERT)).toBeInTheDocument();
    });

    it('should hidden board verify alert when user change email and token input', async () => {
      setup();
      await fillBoardFieldsInformation();
      const mockedError = new UnauthorizedError('', HttpStatusCode.Unauthorized, '');
      boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(mockedError));

      await userEvent.click(screen.getByText(VERIFY));

      expect(screen.getByLabelText(BOARD_VERIFY_ALERT)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/email/i), 'fake@qq.com');
      await userEvent.type(screen.getByLabelText(/token/i), FAKE_TOKEN);

      expect(screen.queryByLabelText(BOARD_VERIFY_ALERT)).not.toBeInTheDocument();
    });
  });

  it('should show reset button and verified button when verify succeed ', async () => {
    mockVerifySuccess();
    setup();
    await fillBoardFieldsInformation();

    await userEvent.click(screen.getByText(VERIFY));

    await waitFor(() => {
      expect(screen.getByText(RESET)).toBeVisible();
    });

    expect(screen.getByText(VERIFIED)).toBeInTheDocument();
  });

  it('should called verifyBoard method once when click verify button', async () => {
    mockVerifySuccess();
    setup();
    await fillBoardFieldsInformation();
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  it('should check loading animation when click verify button', async () => {
    mockVerifySuccess(300);
    setup();
    await fillBoardFieldsInformation();
    await userEvent.click(screen.getByRole('button', { name: VERIFY }));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  it('should show error message when board verify response status is 401', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );
    setup();
    await fillBoardFieldsInformation();

    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Token is invalid, please change your token with correct access permission!/i),
      ).toBeInTheDocument();
    });
  });

  it('should close alert modal when user manually close the alert', async () => {
    setup();
    await fillBoardFieldsInformation();
    const timeoutError = new TimeoutError('', AxiosRequestErrorCode.Timeout);
    boardClient.getVerifyBoard = jest.fn().mockImplementation(() => Promise.reject(timeoutError));

    await userEvent.click(screen.getByText(VERIFY));

    expect(screen.getByLabelText(TIMEOUT_ALERT)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Close'));

    expect(screen.queryByLabelText(TIMEOUT_ALERT)).not.toBeInTheDocument();
  });

  it('should allow user to re-submit when user interact again with form given form is already submit successfully', async () => {
    setup();
    mockVerifySuccess();
    await fillBoardFieldsInformation();

    expect(screen.getByRole('button', { name: /verify/i })).toBeEnabled();

    await userEvent.click(screen.getByText(/verify/i));

    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /verified/i })).toBeDisabled();

    const emailInput = (await screen.findByRole('textbox', { name: 'Email' })) as HTMLInputElement;
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'other@qq.com');
    const verifyButton = await screen.findByRole('button', { name: /verify/i });

    expect(verifyButton).toBeEnabled();
  });
});
