import {
  MOCK_BOARD_URL_FOR_JIRA,
  MOCK_BOARD_VERIFY_REQUEST_PARAMS,
  MOCK_JIRA_BOARD_VERIFY_REQUEST_PARAMS,
  VerifyErrorMessage,
  AxiosErrorMessage,
} from '../fixtures';
import { boardClient } from '@src/clients/board/BoardClient';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';

const server = setupServer(
  http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
    return new HttpResponse('', {
      status: HttpStatusCode.Ok,
    });
  }),
);

describe('verify board request', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should isBoardVerify is true when board verify response status 200', async () => {
    const result = await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);

    expect(result.isBoardVerify).toEqual(true);
  });

  it('should isBoardVerify is true when select jira and board verify response status 200', async () => {
    const result = await boardClient.getVerifyBoard(MOCK_JIRA_BOARD_VERIFY_REQUEST_PARAMS);

    expect(result.isBoardVerify).toEqual(true);
  });

  it('should isNoDoneCard is true when board verify response status 204', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.NoContent,
        });
      }),
    );

    const result = await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);

    expect(result.haveDoneCard).toEqual(false);
    expect(result.isBoardVerify).toEqual(false);
  });

  it('should throw error when board verify response status 400', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse(
          JSON.stringify({
            hintInfo: VerifyErrorMessage.BadRequest,
          }),
          {
            status: HttpStatusCode.BadRequest,
          },
        );
      }),
    );

    boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS).catch((e) => {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toMatch(VerifyErrorMessage.BadRequest);
    });
  });

  it('should throw error when board verify response status 401', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse(
          JSON.stringify({
            hintInfo: VerifyErrorMessage.Unauthorized,
          }),
          {
            status: HttpStatusCode.Unauthorized,
          },
        );
      }),
    );

    await expect(async () => {
      await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);
    }).rejects.toThrow(VerifyErrorMessage.Unauthorized);
  });

  it('should throw error when board verify response status 500', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse(
          JSON.stringify({
            hintInfo: VerifyErrorMessage.InternalServerError,
          }),
          {
            status: HttpStatusCode.InternalServerError,
          },
        );
      }),
    );

    await expect(async () => {
      await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);
    }).rejects.toThrow(VerifyErrorMessage.InternalServerError);
  });

  it('should throw error when board verify response status 503', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse(
          JSON.stringify({
            hintInfo: VerifyErrorMessage.RequestTimeout,
          }),
          {
            status: HttpStatusCode.ServiceUnavailable,
          },
        );
      }),
    );

    await expect(async () => {
      await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);
    }).rejects.toThrow(VerifyErrorMessage.RequestTimeout);
  });

  it('should throw error when board verify response status 300', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return new HttpResponse('', {
          status: HttpStatusCode.MultipleChoices,
        });
      }),
    );

    await expect(async () => {
      await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);
    }).rejects.toThrow(VerifyErrorMessage.Unknown);
  });

  it('should throw `Network Error` when board verify encountered netwrok error', async () => {
    server.use(
      http.post(MOCK_BOARD_URL_FOR_JIRA, () => {
        return HttpResponse.error();
      }),
    );

    await expect(async () => {
      await boardClient.getVerifyBoard(MOCK_BOARD_VERIFY_REQUEST_PARAMS);
    }).rejects.toThrow(AxiosErrorMessage.ErrorNetwork);
  });
});
