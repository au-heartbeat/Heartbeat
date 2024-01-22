import {
  BOARD_FIELDS,
  BOARD_TYPES,
  CONFIG_TITLE,
  ERROR_MESSAGE_COLOR,
  MOCK_BOARD_URL_FOR_JIRA,
  NO_CARD_ERROR_MESSAGE,
  RESET,
  VERIFIED,
  VERIFY,
  VERIFY_ERROR_MESSAGE,
  VERIFY_FAILED,
} from '../../fixtures';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Board } from '@src/containers/ConfigStep/Board';
import { setupStore } from '../../utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

export const fillBoardFieldsInformation = () => {
  const fields = ['Board Id', 'Email', 'Site', 'Token'];
  const mockInfo = ['2', 'mockEmail@qq.com', '1', 'mockToken'];
  const fieldInputs = fields.map((label) => screen.getByTestId(label).querySelector('input') as HTMLInputElement);
  fieldInputs.map((input, index) => {
    fireEvent.change(input, { target: { value: mockInfo[index] } });
  });
  fieldInputs.map((input, index) => {
    expect(input.value).toEqual(mockInfo[index]);
  });
};

let store = null;

const server = setupServer(rest.post(MOCK_BOARD_URL_FOR_JIRA, (req, res, ctx) => res(ctx.status(200))));

describe('Board', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  store = setupStore();
  const setup = () => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );
  };

  afterEach(() => {
    store = null;
  });

  it('should show board title and fields when render board component ', () => {
    setup();

    BOARD_FIELDS.map((field) => {
      expect(screen.getByLabelText(`${field} *`)).toBeInTheDocument();
    });
    expect(screen.getAllByText(CONFIG_TITLE.BOARD)[0]).toBeInTheDocument();
  });

  it('should show default value jira when init board component', () => {
    const { getByRole } = setup();
    const boardType = getByRole('button', {
      name: /board/i,
    });

    expect(boardType).toBeInTheDocument();
  });

  it('should show detail options when click board field', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /board jira/i }));
    const listBox = within(screen.getByRole('listbox'));
    const options = listBox.getAllByRole('option');
    const optionValue = options.map((li) => li.getAttribute('data-value'));

    expect(optionValue).toEqual(Object.values(BOARD_TYPES));
  });

  it('should show board type when select board field value ', async () => {
    const { getByRole, getByText } = setup();

    await userEvent.click(getByRole('button', { name: /board jira/i }));

    await waitFor(() => {
      expect(getByRole('option', { name: /jira/i })).toBeInTheDocument();
    });

    await userEvent.click(getByRole('option', { name: /jira/i }));

    await waitFor(() => {
      expect(
        getByRole('button', {
          name: /board/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it('should show error message when input a wrong type or empty email ', async () => {
    setup();
    const EMAil_INVALID_ERROR_MESSAGE = 'Email is invalid!';
    const emailInput = screen.getByTestId('Email').querySelector('input') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'wrong type email' } });

    expect(screen.getByText(EMAil_INVALID_ERROR_MESSAGE)).toBeVisible();
    expect(screen.getByText(EMAil_INVALID_ERROR_MESSAGE)).toHaveStyle(ERROR_MESSAGE_COLOR);

    fireEvent.change(emailInput, { target: { value: '' } });

    const EMAIL_REQUIRE_ERROR_MESSAGE = 'Email is required!';
    expect(screen.getByText(EMAIL_REQUIRE_ERROR_MESSAGE)).toBeVisible();
  });

  it.skip('should clear other fields information when change board field selection', () => {
    const { getByRole } = setup();
    const boardIdInput = getByRole('textbox', {
      name: 'Board Id',
    }) as HTMLInputElement;
    const emailInput = screen.getByRole('textbox', {
      name: 'Email',
    }) as HTMLInputElement;

    fireEvent.change(boardIdInput, { target: { value: 2 } });
    fireEvent.change(emailInput, { target: { value: 'mockEmail@qq.com' } });
    fireEvent.mouseDown(getByRole('button', { name: CONFIG_TITLE.BOARD }));
    fireEvent.click(
      getByRole('button', {
        name: /jira/i,
      }),
    );

    expect(emailInput.value).toEqual('');
    expect(boardIdInput.value).toEqual('');
  });

  it('should clear all fields information when click reset button', async () => {
    const { getByRole, getByText, queryByRole } = setup();
    const fieldInputs = BOARD_FIELDS.slice(1, 4).map(
      (label) =>
        screen.getByRole('textbox', {
          name: label,
          hidden: true,
        }) as HTMLInputElement,
    );
    fillBoardFieldsInformation();

    fireEvent.click(screen.getByText(VERIFY));

    fieldInputs.map((input) => {
      expect(input.value).toEqual('');
    });
    expect(
      getByRole('button', {
        name: /board/i,
      }),
    ).toBeInTheDocument();
    expect(queryByRole('button', { name: RESET })).not.toBeTruthy();
    expect(queryByRole('button', { name: VERIFY })).toBeDisabled();
  });

  it('should enabled verify button when all fields checked correctly given disable verify button', () => {
    setup();
    const verifyButton = screen.getByRole('button', { name: /verify/i });

    expect(verifyButton).toBeDisabled();

    fillBoardFieldsInformation();

    expect(verifyButton).toBeEnabled();
  });

  it('should show reset button and verified button when verify succeed ', async () => {
    setup();
    fillBoardFieldsInformation();

    fireEvent.click(screen.getByText(VERIFY));

    await waitFor(() => {
      expect(screen.getByText(RESET)).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText(VERIFIED)).toBeTruthy();
    });
  });

  it('should called verifyBoard method once when click verify button', async () => {
    setup();
    fillBoardFieldsInformation();
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  it('should check loading animation when click verify button', async () => {
    const { container } = setup();
    fillBoardFieldsInformation();
    fireEvent.click(screen.getByRole('button', { name: VERIFY }));

    await waitFor(() => {
      expect(container.getElementsByTagName('span')[0].getAttribute('role')).toEqual('progressbar');
    });
  });

  it('should check noCardPop show and disappear when board verify response status is 204', async () => {
    server.use(rest.post(MOCK_BOARD_URL_FOR_JIRA, (req, res, ctx) => res(ctx.status(HttpStatusCode.NoContent))));
    setup();
    fillBoardFieldsInformation();

    fireEvent.click(screen.getByRole('button', { name: VERIFY }));

    await waitFor(() => {
      expect(screen.getByText(NO_CARD_ERROR_MESSAGE)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Ok' }));
    expect(screen.getByText(NO_CARD_ERROR_MESSAGE)).not.toBeVisible();
  });

  it('should check error notification show and disappear when board verify response status is 401', async () => {
    server.use(
      rest.post(MOCK_BOARD_URL_FOR_JIRA, (req, res, ctx) =>
        res(ctx.status(HttpStatusCode.Unauthorized), ctx.json({ hintInfo: VERIFY_ERROR_MESSAGE.UNAUTHORIZED })),
      ),
    );
    setup();
    fillBoardFieldsInformation();

    fireEvent.click(screen.getByRole('button', { name: VERIFY }));

    await waitFor(() => {
      expect(
        screen.getByText(`${BOARD_TYPES.JIRA} ${VERIFY_FAILED}: ${VERIFY_ERROR_MESSAGE.UNAUTHORIZED}`),
      ).toBeInTheDocument();
    });
  });
});
