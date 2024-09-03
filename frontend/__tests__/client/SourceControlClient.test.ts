import {
  MOCK_SOURCE_CONTROL_GET_BRANCH_URL,
  MOCK_SOURCE_CONTROL_GET_CREW_URL,
  MOCK_SOURCE_CONTROL_GET_ORGANIZATION_URL,
  MOCK_SOURCE_CONTROL_GET_REPO_URL,
  MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS,
  MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL,
} from '../fixtures';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { SourceControlTypes } from '@src/constants/resources';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';

const server = setupServer(
  http.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, () => {
    return new HttpResponse(null, {
      status: HttpStatusCode.NoContent,
    });
  }),
);

describe('verify sourceControl request', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should return isSourceControlVerify true when sourceControl verify response status is 204', async () => {
    const result = await sourceControlClient.verifyToken(MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS);

    expect(result.code).toEqual(204);
  });

  it('should set error title when sourceControl verify response status is 401', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );

    const result = await sourceControlClient.verifyToken(MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS);
    expect(result.code).toEqual(HttpStatusCode.Unauthorized);
    expect(result.errorTitle).toEqual('Token is incorrect!');
  });

  it('should set default error title when sourceControl verify response status 500', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.InternalServerError,
        });
      }),
    );

    const result = await sourceControlClient.verifyToken(MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS);
    expect(result.code).toEqual(HttpStatusCode.InternalServerError);
    expect(result.errorTitle).toEqual('Unknown error');
  });

  it('should return organizations when get organizations api return ok', async () => {
    const expectedNames = ['test-org1', 'test-org2'];
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_ORGANIZATION_URL, () => {
        return new HttpResponse(
          JSON.stringify({
            name: expectedNames,
          }),
          {
            status: HttpStatusCode.Ok,
          },
        );
      }),
    );

    const result = await sourceControlClient.getOrganization({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
    });

    expect(result.code).toEqual(200);
    expect(result.data?.name).toEqual(expectedNames);
  });

  it('should set default error title when get organizations api return 401', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_ORGANIZATION_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );

    const result = await sourceControlClient.getOrganization({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
    });

    expect(result.code).toEqual(401);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get organizations api return 403', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_ORGANIZATION_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Forbidden,
        });
      }),
    );

    const result = await sourceControlClient.getOrganization({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
    });

    expect(result.code).toEqual(403);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get organizations api return 500', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_ORGANIZATION_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.InternalServerError,
        });
      }),
    );

    const result = await sourceControlClient.getOrganization({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
    });

    expect(result.code).toEqual(500);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should return repositories when get repositories api return ok', async () => {
    const expectedNames = ['test-repo1', 'test-repo2'];
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_REPO_URL, () => {
        return new HttpResponse(
          JSON.stringify({
            name: expectedNames,
          }),
          {
            status: HttpStatusCode.Ok,
          },
        );
      }),
    );

    const result = await sourceControlClient.getRepo({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      organization: 'org',
      endTime: 123,
    });

    expect(result.code).toEqual(200);
    expect(result.data?.name).toEqual(expectedNames);
  });

  it('should set default error title when get repositories api return 401', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_REPO_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );

    const result = await sourceControlClient.getRepo({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      organization: 'org',
      endTime: 123,
    });

    expect(result.code).toEqual(401);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get repositories api return 403', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_REPO_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Forbidden,
        });
      }),
    );

    const result = await sourceControlClient.getRepo({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      organization: 'org',
      endTime: 123,
    });

    expect(result.code).toEqual(403);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get repositories api return 500', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_REPO_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.InternalServerError,
        });
      }),
    );

    const result = await sourceControlClient.getRepo({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      organization: 'org',
      endTime: 123,
    });

    expect(result.code).toEqual(500);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should return branches when get branches api return ok', async () => {
    const expectedNames = ['test-branch1', 'test-branch2'];
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_BRANCH_URL, () => {
        return new HttpResponse(
          JSON.stringify({
            name: expectedNames,
          }),
          {
            status: HttpStatusCode.Ok,
          },
        );
      }),
    );

    const result = await sourceControlClient.getBranch({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      organization: 'org',
      repo: 'repo',
    });

    expect(result.code).toEqual(200);
    expect(result.data?.name).toEqual(expectedNames);
  });

  it('should set default error title when get branches api return 401', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_BRANCH_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );

    const result = await sourceControlClient.getBranch({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      repo: 'repo',
      organization: 'org',
    });

    expect(result.code).toEqual(401);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get branches api return 403', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_BRANCH_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Forbidden,
        });
      }),
    );

    const result = await sourceControlClient.getBranch({
      type: SourceControlTypes.GitHub,
      repo: 'repo',
      token: 'mock-token',
      organization: 'org',
    });

    expect(result.code).toEqual(403);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get branches api return 500', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_BRANCH_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.InternalServerError,
        });
      }),
    );

    const result = await sourceControlClient.getBranch({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      repo: 'repo',
      organization: 'org',
    });

    expect(result.code).toEqual(500);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should return crews when get crews api return ok', async () => {
    const expectedNames = ['test-branch1', 'test-branch2'];
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_CREW_URL, () => {
        return new HttpResponse(
          JSON.stringify({
            crews: expectedNames,
          }),
          {
            status: HttpStatusCode.Ok,
          },
        );
      }),
    );

    const result = await sourceControlClient.getCrew({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      organization: 'org',
      repo: 'repo',
      branch: 'branch',
      startTime: 123,
      endTime: 123,
    });

    expect(result.code).toEqual(200);
    expect(result.data?.crews).toEqual(expectedNames);
  });

  it('should set default error title when get crews api return 401', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_CREW_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );

    const result = await sourceControlClient.getCrew({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      repo: 'repo',
      organization: 'org',
      branch: 'branch',
      startTime: 123,
      endTime: 123,
    });

    expect(result.code).toEqual(401);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get crews api return 403', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_CREW_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Forbidden,
        });
      }),
    );

    const result = await sourceControlClient.getCrew({
      type: SourceControlTypes.GitHub,
      repo: 'repo',
      branch: 'branch',
      startTime: 123,
      endTime: 123,
      token: 'mock-token',
      organization: 'org',
    });

    expect(result.code).toEqual(403);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });

  it('should set default error title when get crews api return 500', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_GET_CREW_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.InternalServerError,
        });
      }),
    );

    const result = await sourceControlClient.getCrew({
      type: SourceControlTypes.GitHub,
      token: 'mock-token',
      repo: 'repo',
      branch: 'branch',
      startTime: 123,
      endTime: 123,
      organization: 'org',
    });

    expect(result.code).toEqual(500);
    expect(result.errorMessage).toEqual(
      'Please go back to the previous page and change your source control token with correct access permission.',
    );
  });
});
