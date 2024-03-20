import { updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';
import { findCaseInsensitiveType, getJiraBoardToken } from '@src/utils/util';
import { IBoardConfigData } from '@src/containers/ConfigStep/Board/schema';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { selectBoard } from '@src/context/config/configSlice';
import { boardClient } from '@src/clients/board/BoardClient';
import { DEFAULT_HELPER_TEXT } from '@src/constants/commons';
import { BOARD_TYPES } from '@src/constants/resources';
import { REGEX } from '@src/constants/regex';
import { useState } from 'react';

export interface Field {
  key: string;
  name: 'boardId' | 'email' | 'site' | 'token' | 'type';
  value: string;
  validateRule?: (value: string) => boolean;
  validatedError: string;
  verifiedError: string;
  col: number;
}

export interface useVerifyBoardStateInterface {
  verifyJira: (
    data: IBoardConfigData,
  ) => Promise<{ response: Record<string, number | string | boolean>; isBoardVerify: boolean; haveDoneCard: boolean }>;
  fields: Field[];
}

const VALIDATOR = {
  EMAIL: (value: string) => REGEX.EMAIL.test(value),
  TOKEN: (value: string) => REGEX.BOARD_TOKEN.test(value),
};

export const KEYS = {
  BOARD: 'Board',
  BOARD_ID: 'Board Id',
  EMAIL: 'Email',
  SITE: 'Site',
  TOKEN: 'Token',
};

const getValidatedError = (key: string, value: string, validateRule?: (value: string) => boolean) => {
  if (!value) {
    return `${key} is required!`;
  }
  if (validateRule && !validateRule(value)) {
    return `${key} is invalid!`;
  }
  return DEFAULT_HELPER_TEXT;
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
      validatedError: '',
      verifiedError: '',
      col: 1,
    },
    {
      key: KEYS.BOARD_ID,
      name: 'boardId',
      value: boardFields.boardId,
      validatedError: '',
      verifiedError: '',
      col: 1,
    },
    {
      key: KEYS.EMAIL,
      name: 'email',
      value: boardFields.email,
      validateRule: VALIDATOR.EMAIL,
      validatedError: boardFields.email ? getValidatedError(KEYS.EMAIL, boardFields.email, VALIDATOR.EMAIL) : '',
      verifiedError: '',
      col: 1,
    },
    {
      key: KEYS.SITE,
      name: 'site',
      value: boardFields.site,
      validatedError: '',
      verifiedError: '',
      col: 1,
    },
    {
      key: KEYS.TOKEN,
      name: 'token',
      value: boardFields.token,
      validateRule: VALIDATOR.TOKEN,
      validatedError: boardFields.token ? getValidatedError(KEYS.TOKEN, boardFields.token, VALIDATOR.TOKEN) : '',
      verifiedError: '',
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
