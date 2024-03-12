import {
  MOCK_PIPELINE_VERIFY_FORBIDDEN_ERROR_TEXT,
  MOCK_PIPELINE_VERIFY_REQUEST_PARAMS,
  MOCK_PIPELINE_VERIFY_UNAUTHORIZED_TEXT,
  MOCK_PIPELINE_VERIFY_URL,
} from '../fixtures';
import { useVerifyPipelineToolEffect } from '@src/hooks/useVerifyPipelineToolEffect';
import { pipelineToolClient } from '@src/clients/pipeline/PipelineToolClient';
import { HEARTBEAT_EXCEPTION_CODE } from '@src/constants/resources';
import { act, renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.mock('@src/clients/board/BoardClient', () => ({
  pipelineToolClient: {
    verify: jest.fn(),
  },
}));

const server = setupServer(
  rest.post(MOCK_PIPELINE_VERIFY_URL, (req, res, ctx) => {
    return res(ctx.status(HttpStatusCode.NoContent));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('use verify pipelineTool state', () => {
  it('should return empty error message when call verify feature given client returns 204', async () => {
    const { result } = renderHook(() => useVerifyPipelineToolEffect());

    act(() => {
      result.current.verifyPipelineTool(MOCK_PIPELINE_VERIFY_REQUEST_PARAMS);
    });

    await waitFor(() => {
      expect(result.current.verifiedError).toEqual('');
      expect(result.current.isLoading).toEqual(false);
    });
  });

  it('should set error message when verifying pipeline given response status 401', async () => {
    pipelineToolClient.verify = jest.fn().mockImplementation(() => {
      return {
        code: HttpStatusCode.Unauthorized,
        errorTitle: MOCK_PIPELINE_VERIFY_UNAUTHORIZED_TEXT,
      };
    });

    const { result } = renderHook(() => useVerifyPipelineToolEffect());

    act(() => {
      result.current.verifyPipelineTool(MOCK_PIPELINE_VERIFY_REQUEST_PARAMS);
    });

    await waitFor(() => {
      expect(result.current.verifiedError).toEqual(MOCK_PIPELINE_VERIFY_UNAUTHORIZED_TEXT);
    });
  });

  it('should clear error message when explicitly call clear function given error message exists', async () => {
    pipelineToolClient.verify = jest.fn().mockImplementation(() => {
      return {
        code: HttpStatusCode.Forbidden,
        errorTitle: MOCK_PIPELINE_VERIFY_FORBIDDEN_ERROR_TEXT,
      };
    });
    const { result } = renderHook(() => useVerifyPipelineToolEffect());

    act(() => {
      result.current.verifyPipelineTool(MOCK_PIPELINE_VERIFY_REQUEST_PARAMS);
    });

    await waitFor(() => {
      expect(result.current.verifiedError).toEqual(MOCK_PIPELINE_VERIFY_FORBIDDEN_ERROR_TEXT);
    });

    result.current.clearVerifiedError();

    await waitFor(() => {
      expect(result.current.verifiedError).toEqual('');
    });
  });

  it('should set timeout is true when verify api is timeout', async () => {
    pipelineToolClient.verify = jest.fn().mockImplementation(() => {
      return {
        code: HEARTBEAT_EXCEPTION_CODE.TIMEOUT,
      };
    });

    const { result } = renderHook(() => useVerifyPipelineToolEffect());
    await act(() => {
      result.current.verifyPipelineTool(MOCK_PIPELINE_VERIFY_REQUEST_PARAMS);
    });

    await waitFor(() => {
      const isHBTimeOut = result.current.isHBTimeOut;
      expect(isHBTimeOut).toBe(true);
    });
  });
});
