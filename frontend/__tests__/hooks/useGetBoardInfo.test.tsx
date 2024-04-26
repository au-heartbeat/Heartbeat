import { MOCK_BOARD_INFO_URL, FAKE_TOKEN, FAKE_DATE_EARLIER, FAKE_DATE_LATER } from '@test/fixtures';
import { AXIOS_REQUEST_ERROR_CODE } from '@src/constants/resources';
import { useGetBoardInfoEffect } from '@src/hooks/useGetBoardInfo';
import { renderHook, act, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

const server = setupServer();

const mockBoardConfig = {
  type: 'jira',
  boardId: '1',
  projectKey: 'FAKE',
  site: 'fake',
  email: 'fake@fake.com',
  token: FAKE_TOKEN,
  dateRanges: [
    {
      startDate: FAKE_DATE_LATER.startDate,
      endDate: FAKE_DATE_LATER.endDate,
    },
    {
      startDate: FAKE_DATE_EARLIER.startDate,
      endDate: FAKE_DATE_EARLIER.endDate,
    },
  ],
};

describe('use get board info', () => {
  beforeAll(() => server.listen());
  afterAll(() => {
    jest.clearAllMocks();
    server.close();
  });
  it('should got init data when hook render', () => {
    const { result } = renderHook(() => useGetBoardInfoEffect());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toMatchObject({});
  });

  it.each([
    [
      HttpStatusCode.NoContent,
      'No card within selected date range!',
      'Please go back to the previous page and change your collection date, or check your board info!',
    ],
    [
      HttpStatusCode.BadRequest,
      'Failed to get Board configuration!',
      'Please go back to the previous page and check your board info!',
    ],
    [
      HttpStatusCode.Unauthorized,
      'Failed to get Board configuration!',
      'Please go back to the previous page and check your board info!',
    ],
    [
      HttpStatusCode.Forbidden,
      'Failed to get Board configuration!',
      'Please go back to the previous page and check your board info!',
    ],
    [
      HttpStatusCode.NotFound,
      'Failed to get Board configuration!',
      'Please go back to the previous page and check your board info!',
    ],
  ])('should got error message when got code is %s', async (code, title, message) => {
    server.use(
      rest.post(MOCK_BOARD_INFO_URL, (_, res, ctx) => {
        return res(ctx.status(code));
      }),
    );

    const { result } = renderHook(() => useGetBoardInfoEffect());
    await act(() => {
      result.current.getBoardInfo(mockBoardConfig);
    });

    await waitFor(() => {
      expect(result.current.errorMessage.title).toEqual(title);
    });
    expect(result.current.errorMessage.message).toEqual(message);
  });

  it('should get data when mock 4xx error', async () => {
    server.use(
      rest.post(MOCK_BOARD_INFO_URL, (_, res, ctx) => {
        return res(
          ctx.status(HttpStatusCode.BadRequest),
          ctx.json({
            ignoredTargetFields: [
              {
                key: 'description',
                name: 'Description',
                flag: false,
              },
            ],
            jiraColumns: [
              {
                key: 'To Do',
                value: {
                  name: 'TODO',
                  statuses: ['TODO'],
                },
              },
            ],
            targetFields: [
              {
                key: 'issuetype',
                name: 'Issue Type',
                flag: false,
              },
            ],
            users: ['heartbeat user'],
          }),
        );
      }),
    );
    const { result } = renderHook(() => useGetBoardInfoEffect());
    await act(() => {
      result.current.getBoardInfo(mockBoardConfig);
    });

    await waitFor(() => {
      expect(result.current.errorMessage.title).toEqual('Failed to get Board configuration!');
    });
    expect(result.current.errorMessage.message).toEqual(
      'Please go back to the previous page and check your board info!',
    );
  });

  it('should get data when mock 3xx error', async () => {
    server.use(
      rest.post(MOCK_BOARD_INFO_URL, (_, res, ctx) => {
        return res(
          ctx.status(HttpStatusCode.Unused),
          ctx.json({
            code: AXIOS_REQUEST_ERROR_CODE.TIMEOUT,
          }),
        );
      }),
    );
    const { result } = renderHook(() => useGetBoardInfoEffect());
    await act(() => {
      result.current.getBoardInfo(mockBoardConfig);
    });

    await waitFor(() => {
      expect(result.current.errorMessage.title).toEqual('Failed to get Board configuration!');
    });
    expect(result.current.errorMessage.message).toEqual(
      'Please go back to the previous page and check your board info!',
    );
  });

  it('should get data when status is OK', async () => {
    server.use(
      rest.post(MOCK_BOARD_INFO_URL, (_, res, ctx) => {
        return res.once(
          ctx.status(HttpStatusCode.Ok),
          ctx.json({
            ignoredTargetFields: [
              {
                key: 'description',
                name: 'Description',
                flag: false,
              },
            ],
            jiraColumns: [
              {
                key: 'To Do',
                value: {
                  name: 'TODO',
                  statuses: ['TODO'],
                },
              },
            ],
            targetFields: [
              {
                key: 'issuetype',
                name: 'Issue Type',
                flag: false,
              },
            ],
            users: ['heartbeat user'],
          }),
        );
      }),
    );
    const { result } = renderHook(() => useGetBoardInfoEffect());
    await act(() => {
      result.current.getBoardInfo(mockBoardConfig);
    });
  });
});
