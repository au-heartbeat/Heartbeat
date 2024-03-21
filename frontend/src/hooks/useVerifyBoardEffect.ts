import { updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';
import { findCaseInsensitiveType, getJiraBoardToken } from '@src/utils/util';
import { IBoardConfigData } from '@src/containers/ConfigStep/Board/schema';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { selectBoard } from '@src/context/config/configSlice';
import { boardClient } from '@src/clients/board/BoardClient';
import { BOARD_TYPES } from '@src/constants/resources';
import { useState } from 'react';

export interface Field {
  key: string;
  name: 'boardId' | 'email' | 'site' | 'token' | 'type';
  value: string;
  col: number;
}

export interface useVerifyBoardStateInterface {
  verifyJira: (
    data: IBoardConfigData,
  ) => Promise<{ response: Record<string, number | string | boolean>; isBoardVerify: boolean; haveDoneCard: boolean }>;
  fields: Field[];
}

export const KEYS = {
  BOARD: 'Board',
  BOARD_ID: 'Board Id',
  EMAIL: 'Email',
  SITE: 'Site',
  TOKEN: 'Token',
};

export const useVerifyBoardEffect = (): useVerifyBoardStateInterface => {
  const boardFields = useAppSelector(selectBoard);
  const dispatch = useAppDispatch();
  const type = findCaseInsensitiveType(Object.values(BOARD_TYPES), boardFields.type);
  const [fields] = useState<Field[]>([
    {
      key: KEYS.BOARD,
      name: 'type',
      value: type,
      col: 1,
    },
    {
      key: KEYS.BOARD_ID,
      name: 'boardId',
      value: boardFields.boardId,
      col: 1,
    },
    {
      key: KEYS.EMAIL,
      name: 'email',
      value: boardFields.email,
      col: 1,
    },
    {
      key: KEYS.SITE,
      name: 'site',
      value: boardFields.site,
      col: 1,
    },
    {
      key: KEYS.TOKEN,
      name: 'token',
      value: boardFields.token,
      col: 2,
    },
  ]);

  const verifyJira = (data: IBoardConfigData) => {
    dispatch(updateTreatFlagCardAsBlock(true));
    return boardClient.getVerifyBoard({
      ...data,
      token: getJiraBoardToken(data.token, data.email),
    });
  };

  return {
    verifyJira,
    fields,
  };
};
