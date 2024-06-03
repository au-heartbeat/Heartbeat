import { BASE_URL, MOCK_GET_STEPS_PARAMS, VerifyErrorMessage } from '../fixtures';
import { metricsClient } from '@src/clients/MetricsClient';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';

describe('get steps from metrics response', () => {
  const { params, buildId, organizationId, pipelineType, token } = MOCK_GET_STEPS_PARAMS;
  const getStepsUrl = `${BASE_URL}/pipelines/:type/:orgId/pipelines/:buildId/steps`;
  const server = setupServer();
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should return steps when getSteps response status 200', async () => {
    server.use(
      http.get(getStepsUrl, () => {
        return new HttpResponse(JSON.stringify({ steps: ['step1'] }), {
          status: HttpStatusCode.Ok,
        });
      }),
    );

    const result = await metricsClient.getSteps(params[0], buildId, organizationId, pipelineType, token);

    expect(result).toEqual({ response: ['step1'], haveStep: true });
  });

  it('should throw error when getSteps response status 500', async () => {
    server.use(
      http.get(getStepsUrl, () => {
        return new HttpResponse(JSON.stringify({ hintInfo: VerifyErrorMessage.InternalServerError }), {
          status: HttpStatusCode.InternalServerError,
        });
      }),
    );

    await expect(async () => {
      await metricsClient.getSteps(params[0], buildId, organizationId, pipelineType, token);
    }).rejects.toThrow(VerifyErrorMessage.InternalServerError);
  });

  it('should throw error when getSteps response status 400', async () => {
    server.use(
      http.get(getStepsUrl, () => {
        return new HttpResponse(JSON.stringify({ hintInfo: VerifyErrorMessage.BadRequest }), {
          status: HttpStatusCode.BadRequest,
        });
      }),
    );

    await expect(async () => {
      await metricsClient.getSteps(params[0], buildId, organizationId, pipelineType, token);
    }).rejects.toThrow(VerifyErrorMessage.BadRequest);
  });

  it('should show isNoStep True when getSteps response status 204', async () => {
    server.use(
      http.get(getStepsUrl, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.NoContent,
        });
      }),
    );

    const result = await metricsClient.getSteps(params[0], buildId, organizationId, pipelineType, token);

    expect(result).toEqual({ branches: [], response: [], haveStep: false, pipelineCrews: [] });
  });
});
