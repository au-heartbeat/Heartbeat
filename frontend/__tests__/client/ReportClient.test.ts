import {
  MOCK_GENERATE_REPORT_REQUEST_PARAMS,
  MOCK_REPORT_ID,
  MOCK_REPORT_RESPONSE,
  MOCK_RETRIEVE_REPORT_RESPONSE,
  MOCK_SHARE_REPORT_RESPONSE,
  VerifyErrorMessage,
} from '../fixtures';
import { reportClient } from '@src/clients/report/ReportClient';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';

const MOCK_REPORT_URL = 'http://localhost/api/v1/reports';

const server = setupServer(
  http.post(MOCK_REPORT_URL, () => {
    return new HttpResponse(null, {
      status: HttpStatusCode.Ok,
    });
  }),
  http.get(MOCK_REPORT_URL, () => {
    return new HttpResponse(null, {
      status: HttpStatusCode.Ok,
    });
  }),
);

describe('report client', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should get response when generate report request status 202', async () => {
    const excepted = MOCK_RETRIEVE_REPORT_RESPONSE;
    server.use(
      http.post(MOCK_REPORT_URL, () => {
        return new HttpResponse(JSON.stringify(MOCK_RETRIEVE_REPORT_RESPONSE), {
          status: HttpStatusCode.Accepted,
        });
      }),
    );

    await expect(reportClient.retrieveByUrl(MOCK_GENERATE_REPORT_REQUEST_PARAMS, '/reports')).resolves.toStrictEqual(
      excepted,
    );
  });

  it('should throw error when generate report response status 500', async () => {
    server.use(
      http.post(MOCK_REPORT_URL, () => {
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
      await reportClient.retrieveByUrl(MOCK_GENERATE_REPORT_REQUEST_PARAMS, '/reports');
    }).rejects.toThrow(VerifyErrorMessage.InternalServerError);
  });

  it('should throw error when generate report response status 400', async () => {
    server.use(
      http.post(MOCK_REPORT_URL, () => {
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

    await expect(async () => {
      await reportClient.retrieveByUrl(MOCK_GENERATE_REPORT_REQUEST_PARAMS, '/reports');
    }).rejects.toThrow(VerifyErrorMessage.BadRequest);
  });

  it('should throw error when calling pollingReport given response status 500', () => {
    server.use(
      http.get(MOCK_REPORT_URL, () => {
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

    expect(async () => {
      await reportClient.polling(MOCK_REPORT_URL);
    }).rejects.toThrow(VerifyErrorMessage.InternalServerError);
  });

  it('should return status and response when calling pollingReport given response status 201', async () => {
    const excepted = {
      status: HttpStatusCode.Created,
      response: MOCK_REPORT_RESPONSE,
    };
    server.use(
      http.get(MOCK_REPORT_URL, () => {
        return new HttpResponse(JSON.stringify(MOCK_REPORT_RESPONSE), {
          status: HttpStatusCode.Created,
        });
      }),
    );

    await expect(reportClient.polling(MOCK_REPORT_URL)).resolves.toEqual(excepted);
  });

  it('should return response when calling generateReportId given response status 200', async () => {
    const excepted = MOCK_REPORT_ID;
    server.use(
      http.post(MOCK_REPORT_URL, () => {
        return new HttpResponse(MOCK_REPORT_ID, {
          status: HttpStatusCode.Accepted,
        });
      }),
    );

    await expect(reportClient.generateReportId()).resolves.toEqual(excepted);
  });

  it('should return response when calling getReportUrl given response status 200', async () => {
    const excepted = MOCK_SHARE_REPORT_RESPONSE;
    server.use(
      http.get(MOCK_REPORT_URL + '/' + MOCK_REPORT_ID, () => {
        return HttpResponse.json(MOCK_SHARE_REPORT_RESPONSE, {
          status: HttpStatusCode.Accepted,
        });
      }),
    );

    await reportClient.getReportUrl(MOCK_REPORT_ID).then((res) => {
      expect(res.data).toEqual(excepted);
    });
  });

  it('should return response when calling getReportDetail given response status 200', async () => {
    const excepted = MOCK_REPORT_RESPONSE;
    const reportUrl = MOCK_REPORT_URL + '/7d2c46d6-c447-4011-bb77-76f9c493f8ce/detail?startTime=20240513&endTime=20240526';
    server.use(
      http.get(reportUrl, () => {
        return HttpResponse.json(MOCK_REPORT_RESPONSE, {
          status: HttpStatusCode.Accepted,
        });
      }),
    );

    await reportClient.getReportDetail(reportUrl).then((res) => {
      expect(res.data).toEqual(excepted);
    });
  });
});
