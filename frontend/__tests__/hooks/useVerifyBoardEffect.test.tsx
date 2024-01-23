import { useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MOCK_BOARD_URL_FOR_JIRA } from '@test/fixtures';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';

import { Iron } from '@mui/icons-material';
import { rest } from 'msw';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('@src/hooks/useAppDispatch', () => ({
  useAppSelector: () => ({ type: 'Jira' }),
}));

const server = setupServer();

describe('use verify board state', () => {
  beforeAll(() => server.listen());
  afterAll(() => {
    jest.clearAllMocks();
    server.close();
  });
  it('when hook render given none input  then should got initial data state ', async () => {
    const { result } = renderHook(() => useVerifyBoardEffect());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.formFields.length).toBe(5);
  });

  it('when call verify function given success call then should got success callback', async () => {
    server.use(
      rest.post(MOCK_BOARD_URL_FOR_JIRA, (_, res, ctx) => {
        return res(ctx.status(HttpStatusCode.Ok), ctx.json({ projectKey: 'FAKE' }));
      }),
    );

    const { result } = renderHook(() => useVerifyBoardEffect());
    const { verifyJira } = result.current;

    const callback = await verifyJira({
      type: 'jira',
      boardId: '1',
      site: 'fake',
      token: 'fake-token',
      startTime: null,
      endTime: null,
    });

    await waitFor(() => {
      expect(callback.response.projectKey).toEqual('FAKE');
    });
  });

  it('when call verify function given a invalid token then should got email and token fields error message', async () => {
    server.use(
      rest.post(MOCK_BOARD_URL_FOR_JIRA, (_, res, ctx) => {
        return res(ctx.status(HttpStatusCode.Unauthorized));
      }),
    );

    const { result } = renderHook(() => useVerifyBoardEffect());
    await act(() => {
      result.current.verifyJira({
        type: 'jira',
        boardId: '1',
        site: 'fake',
        token: 'fake-token',
        startTime: null,
        endTime: null,
      });
    });

    await waitFor(() => {
      const emailFiled = result.current.formFields.find((field) => field.name === 'email');
      const tokenField = result.current.formFields.find((field) => field.name === 'token');

      expect(emailFiled?.errorMessage).toBe('Email is incorrect !');
      expect(tokenField?.errorMessage).toBe(
        'Token is invalid, please change your token with correct access permission !',
      );
    });
  });

  it('when call verify function given a invalid site then should got site field error message', async () => {
    server.use(
      rest.post(MOCK_BOARD_URL_FOR_JIRA, (_, res, ctx) => {
        return res(
          ctx.status(HttpStatusCode.NotFound),
          ctx.json({
            hintInfo: 'site not found',
          }),
        );
      }),
    );

    const { result } = renderHook(() => useVerifyBoardEffect());
    await act(() => {
      result.current.verifyJira({
        type: 'jira',
        boardId: '1',
        site: 'fake',
        token: 'fake-token',
        startTime: null,
        endTime: null,
      });
    });

    await waitFor(() => {
      const site = result.current.formFields.find((field) => field.name === 'site');

      expect(site?.errorMessage).toBe('Site is incorrect !');
    });
  });

  it('when call verify function given a invalid board id then should got board id field error message', async () => {
    server.use(
      rest.post(MOCK_BOARD_URL_FOR_JIRA, (_, res, ctx) => {
        return res(
          ctx.status(HttpStatusCode.NotFound),
          ctx.json({
            hintInfo: 'boardId not found',
          }),
        );
      }),
    );

    const { result } = renderHook(() => useVerifyBoardEffect());
    await act(() => {
      result.current.verifyJira({
        type: 'jira',
        boardId: '1',
        site: 'fake',
        token: 'fake-token',
        startTime: null,
        endTime: null,
      });
    });

    await waitFor(() => {
      const boardId = result.current.formFields.find((field) => field.name === 'boardId');

      expect(boardId?.errorMessage).toBe('Board Id is incorrect !');
    });
  });
});
