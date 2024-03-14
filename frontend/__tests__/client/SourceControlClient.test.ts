import { MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS } from '../fixtures';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(rest.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, (req, res, ctx) => res(ctx.status(204))));

describe('verify sourceControl request', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should return isSourceControlVerify true when sourceControl verify response status is 204', async () => {
    const result = await sourceControlClient.verifyToken(
      MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS,
      jest.fn(),
      jest.fn(),
    );

    expect(result.code).toEqual(204);
  });

  it('should throw error when sourceControl verify response status is 401', async () => {
    server.use(rest.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, (req, res, ctx) => res(ctx.status(401))));

    const result = await sourceControlClient.verifyToken(
      MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS,
      jest.fn(),
      jest.fn(),
    );
    expect(result.code).toEqual(401);
    expect(result.errorTitle).toEqual('Token is incorrect!');
  });

  it('should throw error when sourceControl verify response status 500', async () => {
    server.use(rest.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, (req, res, ctx) => res(ctx.status(500))));

    const result = await sourceControlClient.verifyToken(
      MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS,
      jest.fn(),
      jest.fn(),
    );
    expect(result.code).toEqual(500);
    expect(result.errorTitle).toEqual('Unknown error');
  });
});
