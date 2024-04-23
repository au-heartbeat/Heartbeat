import { render, waitFor } from '@testing-library/react';
import { setupStore } from '../../utils/setupStoreUtil';
import MetricsStep from '@src/containers/MetricsStep';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { MOCK_BUILD_KITE_GET_INFO_RESPONSE, MOCK_PIPELINE_GET_INFO_URL, MOCK_BOARD_INFO_URL } from '../../fixtures';
import { addNotification } from '@src/context/notification/NotificationSlice';
import { HttpStatusCode } from 'axios';

let store = setupStore();
const server = setupServer(
  rest.post(MOCK_PIPELINE_GET_INFO_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.body(JSON.stringify(MOCK_BUILD_KITE_GET_INFO_RESPONSE))),
  ),
);

const setup = () =>
  render(
    <Provider store={store}>
      <MetricsStep />
    </Provider>,
  );

jest.mock('@src/context/notification/NotificationSlice', () => ({
  ...jest.requireActual('@src/context/notification/NotificationSlice'),
  addNotification: jest.fn().mockReturnValue({ type: 'ADD_NEW_NOTIFICATION' }),
}));

jest.mock('@src/hooks/useGetBoardInfo', () => ({
  ...jest.requireActual('@src/hooks/useGetBoardInfo'),
  useGetBoardInfoEffect: jest.fn().mockReturnValue({
    boardInfoFailedStatus: 1,
  }),
}));

describe('MetricsStep', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  beforeEach(() => {
    store = setupStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show 4xx popup when call get partial 4xx error', async () => {
    server.use(
      rest.post(MOCK_BOARD_INFO_URL, (_, res, ctx) => {
        return res.once(ctx.status(HttpStatusCode.BadRequest));
      }),
    );

    setup();

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalled();
    });
  });
});
