import { initSourceControlVerifyResponseState, ISourceControlVerifyResponse } from './verifyResponseSlice';
import { SourceControlTypes } from '@src/constants/resources';

export interface ISourceControl {
  config: { type: string; site: string; token: string };
  isShow: boolean;
  verifiedResponse: ISourceControlVerifyResponse;
}

export const initialSourceControlState: ISourceControl = {
  config: {
    type: SourceControlTypes.GitHub,
    site: '',
    token: '',
  },
  isShow: false,
  verifiedResponse: initSourceControlVerifyResponseState,
};
