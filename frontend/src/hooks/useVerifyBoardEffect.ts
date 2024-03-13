import { selectBoard, updateBoard, updateBoardVerifyState } from '@src/context/config/configSlice';
import { BOARD_TYPES, MESSAGE, UNKNOWN_ERROR_TITLE } from '@src/constants/resources';
import { updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';
import { findCaseInsensitiveType, getJiraBoardToken } from '@src/utils/util';
import { IBoardConfigData } from '@src/containers/ConfigStep/Board/schema';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { DEFAULT_HELPER_TEXT, EMPTY_STRING } from '@src/constants/commons';
import { IHeartBeatException } from '@src/exceptions/ExceptionType';
import { boardClient } from '@src/clients/board/BoardClient';
import { isHeartBeatException } from '@src/exceptions';
import { REGEX } from '@src/constants/regex';
import { HttpStatusCode } from 'axios';
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
  verifyJira: (data: IBoardConfigData) => Promise<void>;
  isLoading: boolean;
  fields: Field[];
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
  const [isLoading, setIsLoading] = useState(false);
  const boardFields = useAppSelector(selectBoard);
  const dispatch = useAppDispatch();
  const type = findCaseInsensitiveType(Object.values(BOARD_TYPES), boardFields.type);
  const [fields, setFields] = useState<Field[]>([
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
            validatedError: '',
            verifiedError: '',
          },
    );
    handleUpdate(newFields);
  };

  const setVerifiedError = (keys: string[], messages: string[]) => {
    setFields(
      fields.map((field) => {
        return keys.includes(field.key)
          ? {
              ...field,
              validatedError: '',
              verifiedError: messages[keys.findIndex((key) => key === field.key)],
            }
          : field;
      }),
    );
  };

  const verifyJira = async (data: IBoardConfigData) => {
    setIsLoading(true);
    dispatch(updateTreatFlagCardAsBlock(true));
    try {
      const res: { response: Record<string, string> } = await boardClient.getVerifyBoard({
        ...data,
        token: getJiraBoardToken(data.token, data.email),
      });
      if (res?.response) {
        dispatch(updateBoardVerifyState(true));
        dispatch(updateBoard({ ...data, projectKey: res.response.projectKey }));
      }
    } catch (e) {
      if (isHeartBeatException(e)) {
        const { description, code } = e as IHeartBeatException;
        if (code === HttpStatusCode.Unauthorized) {
          setVerifiedError(
            [KEYS.EMAIL, KEYS.TOKEN],
            [MESSAGE.VERIFY_MAIL_FAILED_ERROR, MESSAGE.VERIFY_TOKEN_FAILED_ERROR],
          );
        } else if (code === HttpStatusCode.NotFound && description === ERROR_INFO.SITE_NOT_FOUND) {
          setVerifiedError([KEYS.SITE], [MESSAGE.VERIFY_SITE_FAILED_ERROR]);
        } else if (code === HttpStatusCode.NotFound && description === ERROR_INFO.BOARD_NOT_FOUND) {
          setVerifiedError([KEYS.BOARD_ID], [MESSAGE.VERIFY_BOARD_FAILED_ERROR]);
        } else {
          setVerifiedError([KEYS.TOKEN], [UNKNOWN_ERROR_TITLE]);
        }
      }
    }
    setIsLoading(false);
  };

  return {
    verifyJira,
    isLoading,
    fields,
    resetFields,
  };
};
