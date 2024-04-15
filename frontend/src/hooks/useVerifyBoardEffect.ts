import { TBoardFieldKeys, BOARD_CONFIG_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { AXIOS_REQUEST_ERROR_CODE, UNKNOWN_ERROR_TITLE } from '@src/constants/resources';
import { updateBoard, updateBoardVerifyState } from '@src/context/config/configSlice';
import { useDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';
import { updateShouldGetBoardConfig } from '@src/context/Metrics/metricsSlice';
import { IBoardConfigData } from '@src/containers/ConfigStep/Form/schema';
import { BoardRequestDTO } from '@src/clients/board/dto/request';
import { boardClient } from '@src/clients/board/BoardClient';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { getJiraBoardToken } from '@src/utils/util';
import { IAppError } from '@src/errors/ErrorType';
import { useFormContext } from 'react-hook-form';
import { isAppError } from '@src/errors';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';

export interface IField {
  key: TBoardFieldKeys;
  col: number;
  defaultValue: IBoardConfigData[keyof IBoardConfigData];
}

export interface useVerifyBoardStateInterface {
  isVerifyTimeOut: boolean;
  verifyJira: () => Promise<void>;
  isLoading: boolean;
  fields: IField[];
  resetFields: () => void;
  setIsShowAlert: (value: boolean) => void;
  isShowAlert: boolean;
}

const ERROR_INFO = {
  SITE_NOT_FOUND: 'site is incorrect',
  BOARD_NOT_FOUND: 'boardId is incorrect',
};

export const KEYS: { [key: string]: TBoardFieldKeys } = {
  BOARD: 'type',
  BOARD_ID: 'boardId',
  EMAIL: 'email',
  SITE: 'site',
  TOKEN: 'token',
};

export const useVerifyBoardEffect = (): useVerifyBoardStateInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyTimeOut, setIsVerifyTimeOut] = useState(false);
  const [isShowAlert, setIsShowAlert] = useState(false);
  const dispatch = useAppDispatch();
  const { boardConfigOriginal, boardConfigWithImport } = useDefaultValues();
  const { reset, setError, getValues } = useFormContext();

  const originalFields: IField[] = [
    {
      key: KEYS.BOARD,
      col: 1,
      defaultValue: boardConfigWithImport.type,
    },
    {
      key: KEYS.BOARD_ID,
      col: 1,
      defaultValue: boardConfigWithImport.boardId,
    },
    {
      key: KEYS.EMAIL,
      col: 1,
      defaultValue: boardConfigWithImport.email,
    },
    {
      key: KEYS.SITE,
      col: 1,
      defaultValue: boardConfigWithImport.site,
    },
    {
      key: KEYS.TOKEN,
      col: 2,
      defaultValue: boardConfigWithImport.token,
    },
  ];

  const persistReduxData = (verifyState: boolean, boardInfo: IBoardConfigData & { projectKey?: string }) => {
    dispatch(updateBoardVerifyState(verifyState));
    dispatch(updateBoard(boardInfo));
  };

  const resetFields = () => {
    reset(boardConfigOriginal);
    persistReduxData(false, boardConfigOriginal);
    setIsShowAlert(false);
  };

  const verifyJira = async () => {
    setIsLoading(true);
    dispatch(updateTreatFlagCardAsBlock(true));
    const boardInfo = getValues() as BoardRequestDTO;
    try {
      const res: { response: Record<string, string> } = await boardClient.getVerifyBoard({
        ...boardInfo,
        token: getJiraBoardToken(boardInfo.token, boardInfo.email),
      });
      if (res?.response) {
        setIsShowAlert(false);
        setIsVerifyTimeOut(false);
        dispatch(updateShouldGetBoardConfig(true));
        persistReduxData(true, { ...boardInfo, projectKey: res.response.projectKey });
      }
    } catch (e) {
      if (isAppError(e)) {
        const { description, code } = e as IAppError;
        setIsShowAlert(false);
        setIsVerifyTimeOut(false);
        if (code === HttpStatusCode.Unauthorized) {
          setError(KEYS.EMAIL, { message: BOARD_CONFIG_ERROR_MESSAGE.email.verifyFailed });
          setError(KEYS.TOKEN, { message: BOARD_CONFIG_ERROR_MESSAGE.token.verifyFailed });
        } else if (code === HttpStatusCode.NotFound && description === ERROR_INFO.SITE_NOT_FOUND) {
          setError(KEYS.SITE, { message: BOARD_CONFIG_ERROR_MESSAGE.site.verifyFailed });
        } else if (code === HttpStatusCode.NotFound && description === ERROR_INFO.BOARD_NOT_FOUND) {
          setError(KEYS.BOARD_ID, { message: BOARD_CONFIG_ERROR_MESSAGE.boardId.verifyFailed });
        } else if (code === AXIOS_REQUEST_ERROR_CODE.TIMEOUT) {
          setIsVerifyTimeOut(true);
          setIsShowAlert(true);
        } else {
          setError(KEYS.TOKEN, { message: UNKNOWN_ERROR_TITLE });
        }
      }
    }
    setIsLoading(false);
  };

  return {
    verifyJira,
    isLoading,
    fields: originalFields,
    resetFields,
    isVerifyTimeOut,
    isShowAlert,
    setIsShowAlert,
  };
};
