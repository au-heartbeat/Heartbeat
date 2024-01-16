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
        response: Record<string, string>;
      }
    | undefined
  >;
  isLoading: boolean;
  errorFields: Record<string, string>;
}

export const useVerifyBoardEffect = (): useVerifyBoardStateInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorFields, setErrorFields] = useState({});

  const verifyJira = (params: BoardRequestDTO) => {
    setIsLoading(true);
    return boardClient
      .getVerifyBoard(params)
      .then((result) => {
        setErrorFields({});
        return result;
      })
      .catch((e) => {
        const { hintInfo, status } = e;
        if (status === 401) {
          setErrorFields({
            mail: 'Email is incorrect !',
            token: 'Token is invalid, please change your token with correct access permission !',
          });
        }
        return e;
      })
      .finally(() => setIsLoading(false));
  };

  return {
    verifyJira,
    isLoading,
    errorFields,
  };
};
