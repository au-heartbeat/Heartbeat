import { selectBoard, selectDateRange, updateBoard, updateBoardVerifyState } from '@src/context/config/configSlice';
import { findCaseInsensitiveType, getJiraBoardToken } from '@src/utils/util';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { DEFAULT_HELPER_TEXT, EMPTY_STRING } from '@src/constants/commons';
import { IHeartBeatException } from '@src/exceptions/ExceptionType';
import { BoardRequestDTO } from '@src/clients/board/dto/request';
import { BOARD_TYPES, MESSAGE } from '@src/constants/resources';
import { boardClient } from '@src/clients/board/BoardClient';
import { isHeartBeatException } from '@src/exceptions';
import { REGEX } from '@src/constants/regex';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';
import { updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';

export interface Field {
  key: string;
  value: string;
  validRule?: (value: string) => boolean;
  errorMessage: string;
  col: number;
}

export interface useVerifyBoardStateInterface {
  verifyJira: () => Promise<void>;
  isLoading: boolean;
  fields: Field[];
  updateField: (key: string, value: string) => void;
  resetFields: () => void;
}

const ERROR_INFO = {
  SITE_NOT_FOUND: 'site is incorrect',
  BOARD_NOT_FOUND: 'boardId is incorrect',
};

const VALIDATOR = {
  EMAIL: (value: string) => REGEX.EMAIL.test(value),
  TOKEN: (value: string) => REGEX.BOARD_TOKEN.test(value),
};

const KEYS = {
  BOARD: 'Board',
  BOARD_ID: 'Board Id',
  EMAIL: 'Email',
  SITE: 'Site',
  TOKEN: 'Token',
};

const getErrorMessage = (key: string, value: string, validRule?: (value: string) => boolean) => {
  if (!value) {
    return `${key} is required!`;
  }
  if (validRule && !validRule(value)) {
    return `${key} is invalid!`;
  }
  return DEFAULT_HELPER_TEXT;
};

export const useVerifyBoardEffect = (): useVerifyBoardStateInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const boardFields = useAppSelector(selectBoard);
  const dateRange = useAppSelector(selectDateRange);
  const dispatch = useAppDispatch();
  const type = findCaseInsensitiveType(Object.values(BOARD_TYPES), boardFields.type);
  const [fields, setFields] = useState<Field[]>([
    {
      key: KEYS.BOARD,
      value: type,
      errorMessage: getErrorMessage(KEYS.BOARD, type),
      col: 1,
    },
    {
      key: KEYS.BOARD_ID,
      value: boardFields.boardId,
      errorMessage: getErrorMessage(KEYS.BOARD_ID, boardFields.boardId),
      col: 1,
    },
    {
      key: KEYS.EMAIL,
      value: boardFields.email,
      validRule: VALIDATOR.EMAIL,
      errorMessage: getErrorMessage(KEYS.EMAIL, boardFields.email, VALIDATOR.EMAIL),
      col: 1,
    },
    {
      key: KEYS.SITE,
      value: boardFields.site,
      errorMessage: getErrorMessage(KEYS.SITE, boardFields.site),
      col: 1,
    },
    {
      key: KEYS.TOKEN,
      value: boardFields.token,
      validRule: VALIDATOR.TOKEN,
      errorMessage: getErrorMessage(KEYS.TOKEN, boardFields.token, VALIDATOR.TOKEN),
      col: 2,
    },
  ]);

  const getBoardInfo = (fields: Field[]) => {
    const keys = ['type', 'boardId', 'email', 'site', 'token'];
    return keys.reduce((board, key, index) => ({ ...board, [key]: fields[index].value }), {});
  };

  const handleUpdate = (fields: Field[]) => {
    setFields(fields);
    dispatch(updateBoardVerifyState(false));
    dispatch(updateBoard(getBoardInfo(fields)));
  };

  const resetFields = () => {
    const newFields = fields.map((field) =>
      field.key === KEYS.BOARD
        ? field
        : {
            ...field,
            value: EMPTY_STRING,
            errorMessage: getErrorMessage(field.key, EMPTY_STRING, field.validRule),
          },
    );
    handleUpdate(newFields);
  };

  const updateField = (key: string, value: string) => {
    const newFields = fields.map((field) => {
      return field.key === key
        ? {
            ...field,
            value: value.trim(),
            errorMessage: getErrorMessage(field.key, value.trim(), field.validRule),
          }
        : field;
    });
    handleUpdate(newFields);
  };

  const setErrorMessage = (keys: string[], messages: string[]) => {
    setFields(
      fields.map((field) => {
        return keys.includes(field.key)
          ? { ...field, errorMessage: messages[keys.findIndex((key) => key === field.key)] }
          : field;
      }),
    );
  };

  const verifyJira = async () => {
    setIsLoading(true);
    dispatch(updateTreatFlagCardAsBlock(true));
    const boardInfo = getBoardInfo(fields) as BoardRequestDTO;
    try {
      const res: { response: Record<string, string> } = await boardClient.getVerifyBoard({
        ...boardInfo,
        startTime: dayjs(dateRange.startDate).valueOf(),
        endTime: dayjs(dateRange.endDate).valueOf(),
        token: getJiraBoardToken(boardInfo.token, boardInfo.email),
      });
      if (res?.response) {
        dispatch(updateBoardVerifyState(true));
        dispatch(updateBoard({ ...boardInfo, projectKey: res.response.projectKey }));
      }
    } catch (e) {
      if (isHeartBeatException(e)) {
        const { description, code } = e as IHeartBeatException;
        if (code === HttpStatusCode.Unauthorized) {
          setErrorMessage([KEYS.TOKEN], [MESSAGE.VERIFY_TOKEN_FAILED_ERROR]);
        }
        if (code === HttpStatusCode.NotFound && description === ERROR_INFO.SITE_NOT_FOUND) {
          setErrorMessage([KEYS.SITE], [MESSAGE.VERIFY_SITE_FAILED_ERROR]);
        }
        if (code === HttpStatusCode.NotFound && description === ERROR_INFO.BOARD_NOT_FOUND) {
          setErrorMessage([KEYS.BOARD_ID], [MESSAGE.VERIFY_BOARD_FAILED_ERROR]);
        }
      }
    }
    setIsLoading(false);
  };

  return {
    verifyJira,
    isLoading,
    fields,
    updateField,
    resetFields,
  };
};
