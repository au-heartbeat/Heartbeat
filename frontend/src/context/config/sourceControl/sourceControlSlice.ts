import { initSourceControlVerifyResponseState, ISourceControlVerifyResponse } from './verifyResponseSlice';
import { SourceControlTypes } from '@src/constants/resources';

export interface ISourceControl {
  config: { type: string; token: string };
  isShow: boolean;
  verifiedResponse: ISourceControlVerifyResponse;
}

export const initialSourceControlState: ISourceControl = {
  config: {
    type: SourceControlTypes.GitHub,
    token: '',
  },
  isShow: false,
  verifiedResponse: initSourceControlVerifyResponseState,
};
