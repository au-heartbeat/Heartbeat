import {
  MOCK_PIPELINE_VERIFY_FORBIDDEN_ERROR_TEXT,
  MOCK_PIPELINE_VERIFY_UNAUTHORIZED_TEXT,
  UNKNOWN_ERROR_TEXT,
} from '../fixtures';
import { pipelineToolDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { useVerifyPipelineToolEffect } from '@src/hooks/useVerifyPipelineToolEffect';
import { pipelineToolClient } from '@src/clients/pipeline/PipelineToolClient';
import { pipelineToolSchema } from '@src/containers/ConfigStep/Form/schema';
import { AXIOS_REQUEST_ERROR_CODE } from '@src/constants/resources';
import { FormProvider } from '@test/utils/FormProvider';
import { PIPELINE_TOOL_TYPES } from '@test/fixtures';
import { renderHook } from '@testing-library/react';
import { HttpStatusCode } from 'axios';
import { ReactNode } from 'react';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('@src/hooks/useAppDispatch', () => ({
  useAppSelector: () => ({ type: PIPELINE_TOOL_TYPES.BUILD_KITE }),
  useAppDispatch: jest.fn(() => jest.fn()),
}));

const setErrorSpy = jest.fn();
const resetSpy = jest.fn();

jest.mock('react-hook-form', () => {
  return {
    ...jest.requireActual('react-hook-form'),
    useFormContext: () => {
      const { useFormContext } = jest.requireActual('react-hook-form');
      const originals = useFormContext();
      return {
        ...originals,
        setError: (...args: any) => {
          console.log('args', args);
          setErrorSpy(...args);
        },
        reset: (...args: any) => resetSpy(...args),
      };
    },
  };
});

const HookWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <FormProvider defaultValues={pipelineToolDefaultValues} schema={pipelineToolSchema}>
      {children}
    </FormProvider>
  );
};

describe('use verify pipelineTool state', () => {
  beforeEach(() => {
    setErrorSpy.mockClear();
    resetSpy.mockClear();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('should keep verified values when call verify feature given client returns 204', async () => {
    pipelineToolClient.verify = jest.fn().mockResolvedValue({
      code: HttpStatusCode.NoContent,
    });

    const { result } = renderHook(useVerifyPipelineToolEffect, { wrapper: HookWrapper });
    await result.current.verifyPipelineTool();

    expect(resetSpy).toHaveBeenCalledWith({ type: 'BuildKite', token: '' }, { keepValues: true });
  });

  const errorScenarios = [
    {
      mock: {
        code: HttpStatusCode.Unauthorized,
        errorTitle: MOCK_PIPELINE_VERIFY_UNAUTHORIZED_TEXT,
      },
      field: 'token',
      status: '401',
      message: 'Token is incorrect!',
    },
    {
      mock: {
        code: HttpStatusCode.Forbidden,
        errorTitle: MOCK_PIPELINE_VERIFY_FORBIDDEN_ERROR_TEXT,
      },
      field: 'token',
      status: '403',
      message: 'Forbidden request, please change your token with correct access permission.',
    },
    {
      mock: {
        code: HttpStatusCode.ServiceUnavailable,
        errorTitle: UNKNOWN_ERROR_TEXT,
      },
      field: 'token',
      status: 'Unknown',
      message: 'Unknown error',
    },
    {
      mock: {
        code: AXIOS_REQUEST_ERROR_CODE.TIMEOUT,
        errorTitle: '',
      },
      field: 'token',
      status: 'Timeout',
      message: 'Timeout!',
    },
  ];

  it.each(errorScenarios)(
    'should set $field error message when verifying pipeline given response status',
    async ({ mock, field, message }) => {
      pipelineToolClient.verify = jest.fn().mockResolvedValue(mock);

      const { result } = renderHook(useVerifyPipelineToolEffect, { wrapper: HookWrapper });
      await result.current.verifyPipelineTool();

      expect(setErrorSpy).toHaveBeenCalledWith(field, { message });
    },
  );

  it('should clear all verified error messages when call resetFeilds', async () => {
    const { result } = renderHook(useVerifyPipelineToolEffect, { wrapper: HookWrapper });

    result.current.resetFields();

    expect(resetSpy).toHaveBeenCalledWith({
      type: 'BuildKite',
      token: '',
    });
  });
});
