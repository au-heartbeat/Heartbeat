import { initialPipelineToolVerifiedResponseState, IPipelineToolVerifyResponse } from './verifyResponseSlice';
import { PIPELINE_TOOL_TYPES } from '@src/constants/resources';

export interface IPipelineToolState {
  config: { type: string; token: string };
  isVerified: boolean;
  shouldCallInfoApi: boolean;
  shouldCallStepApi: boolean;
  isShow: boolean;
  verifiedResponse: IPipelineToolVerifyResponse;
}

export const initialPipelineToolState: IPipelineToolState = {
  config: {
    type: PIPELINE_TOOL_TYPES.BUILD_KITE,
    token: '',
  },
  isVerified: false,
  shouldCallInfoApi: true,
  shouldCallStepApi: true,
  isShow: false,
  verifiedResponse: initialPipelineToolVerifiedResponseState,
};
