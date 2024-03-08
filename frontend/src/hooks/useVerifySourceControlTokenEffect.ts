import { SourceControlVerifyRequestDTO } from '@src/clients/sourceControl/dto/request';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { updateSourceControlVerifyState } from '@src/context/config/configSlice';
import { HEARTBEAT_EXCEPTION_CODE } from '@src/constants/resources';
import { useAppDispatch } from '@src/hooks/index';
import { useCallback, useState } from 'react';
import { HttpStatusCode } from 'axios';

export const useVerifySourceControlTokenEffect = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedError, setVerifiedError] = useState<string>();
  const [isHBTimeOut, setIsHBTimeOut] = useState(false);
  const [isShowAlert, setIsShowAlert] = useState(false);
  const verifyToken = async (params: SourceControlVerifyRequestDTO) => {
    setIsLoading(true);
    const response = await sourceControlClient.verifyToken(params);
    if (response.code === HttpStatusCode.NoContent) {
      dispatch(updateSourceControlVerifyState(true));
    } else if (response.code === HEARTBEAT_EXCEPTION_CODE.TIMEOUT) {
      setIsHBTimeOut(true);
      setIsShowAlert(true);
    } else {
      dispatch(updateSourceControlVerifyState(false));
      setVerifiedError(response.errorTitle);
    }
    setIsLoading(false);
    return response;
  };

  const clearVerifiedError = useCallback(() => {
    setVerifiedError('');
  }, []);

  return {
    verifyToken,
    isLoading,
    verifiedError,
    clearVerifiedError,
    isHBTimeOut,
    isShowAlert,
    setIsShowAlert,
  };
};
