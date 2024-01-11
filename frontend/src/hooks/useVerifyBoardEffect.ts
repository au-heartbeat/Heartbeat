import { BoardRequestDTO } from '@src/clients/board/dto/request';
import { boardClient } from '@src/clients/board/BoardClient';
import { MESSAGE } from '@src/constants/resources';
import { DURATION } from '@src/constants/commons';
import { useState } from 'react';

export interface useVerifyBoardStateInterface {
  verifyJira: (params: BoardRequestDTO) => Promise<
    | {
        isBoardVerify: boolean;
        haveDoneCard: boolean;
        response: Record<string, any>;
      }
    | undefined
  >;
  isLoading: boolean;
  errorMessage: string;
  errorFields: Record<string, string>;
}

export const useVerifyBoardEffect = (): useVerifyBoardStateInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});

  const verifyJira = async (params: BoardRequestDTO) => {
    setIsLoading(true);
    try {
      return await boardClient.getVerifyBoard(params);
    } catch (e) {
      const err = e as Error;
      setErrorMessage(`${params.type} ${MESSAGE.VERIFY_FAILED_ERROR}: ${err.message}`);
      setTimeout(() => {
        setErrorMessage('');
      }, DURATION.ERROR_MESSAGE_TIME);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyJira,
    isLoading,
    errorMessage,
    errorFields,
  };
};
