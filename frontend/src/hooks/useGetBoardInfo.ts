import { useState } from 'react';
import { boardInfoClient } from '@src/clients/board/BoardInfoClient';
import { BoardInfoRequestDTO } from '@src/clients/board/dto/request';
import { AxiosResponse } from 'axios';

export interface useGetBoardInfoInterface {
  getBoardInfo: (data: BoardInfoRequestDTO) => Promise<AxiosResponse<string, string>>;
  isLoading: boolean;
  errorFields?: Record<string, string>;
}

export const useGetBoardInfoEffect = (): useGetBoardInfoInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const getBoardInfo = (data: BoardInfoRequestDTO) => {
    setIsLoading(true);
    return boardInfoClient.getBoardInfo(data).finally(() => setIsLoading(false));
  };
  return {
    getBoardInfo,
    isLoading,
  };
};
