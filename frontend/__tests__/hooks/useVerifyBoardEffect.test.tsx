import { useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { renderHook } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { BOARD_TYPES } from '@test/fixtures';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('@src/hooks/useAppDispatch', () => ({
  useAppSelector: () => ({ type: BOARD_TYPES.JIRA }),
  useAppDispatch: jest.fn(() => jest.fn()),
}));

const server = setupServer();

describe('use verify board state', () => {
  beforeAll(() => server.listen());
  afterAll(() => {
    jest.clearAllMocks();
    server.close();
  });
  it('should got initial data state when hook render given none input', async () => {
    const { result } = renderHook(() => useVerifyBoardEffect());
    expect(result.current.fields.length).toBe(5);
  });
});
