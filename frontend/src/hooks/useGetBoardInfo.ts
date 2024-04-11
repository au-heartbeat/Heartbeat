import { BOARD_CONFIG_INFO_ERROR, BOARD_CONFIG_INFO_TITLE } from '@src/constants/resources';
import { BoardInfoConfigDTO } from '@src/clients/board/dto/request';
import { boardInfoClient } from '@src/clients/board/BoardInfoClient';
import { AXIOS_REQUEST_ERROR_CODE } from '@src/constants/resources';
import { HttpStatusCode } from 'axios';
import { ReactNode, useState } from 'react';
import get from 'lodash/get';
import dayjs from 'dayjs';

export type JiraColumns = Record<string, string>[];
export type TargetFields = Record<string, string>[];
export type Users = string[];
export interface BoardInfoResponse {
  jiraColumns: JiraColumns;
  targetFields: TargetFields;
  ignoredTargetFields: TargetFields;
  users: Users;
}
export interface useGetBoardInfoInterface {
  getBoardInfo: (data: BoardInfoConfigDTO) => Promise<Awaited<void>[]>;
  isLoading: boolean;
  errorMessage: Record<string, ReactNode>;
}

const codeMapping = (code: string | number) => {
  const codes = {
    [HttpStatusCode.BadRequest]: {
      title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
      message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
      code: HttpStatusCode.BadRequest,
    },
    [HttpStatusCode.Unauthorized]: {
      title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
      message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
      code: HttpStatusCode.Unauthorized,
    },
    [HttpStatusCode.Forbidden]: {
      title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
      message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
      code: HttpStatusCode.Forbidden,
    },
    [HttpStatusCode.NotFound]: {
      title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
      message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
      code: HttpStatusCode.NotFound,
    },
    [AXIOS_REQUEST_ERROR_CODE.TIMEOUT]: {
      title: BOARD_CONFIG_INFO_TITLE.EMPTY,
      message: BOARD_CONFIG_INFO_ERROR.RETRY,
      code: AXIOS_REQUEST_ERROR_CODE.TIMEOUT,
    },
  };
  return get(codes, code);
};

export const useGetBoardInfoEffect = (): useGetBoardInfoInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});

  const getBoardInfo = async (data: BoardInfoConfigDTO) => {
    setIsLoading(true);
    setErrorMessage({});
    let dateRangeCopy = Array.from(data.dateRange);
    dateRangeCopy.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());

    const allBoardData = dateRangeCopy.map((info) => {
      const { dateRange, ...needInfoRequest } = data;
      const boardInfoRequest = {
        ...needInfoRequest,
        startTime: dayjs(info.startDate).valueOf().toString(),
        endTime: dayjs(info.endDate).valueOf().toString(),
      };

      return boardInfoClient
        .getBoardInfo(boardInfoRequest)
        .then((res) => {
          if (!res.data) {
            setErrorMessage({
              title: BOARD_CONFIG_INFO_TITLE.NO_CONTENT,
              message: BOARD_CONFIG_INFO_ERROR.NOT_CONTENT,
              code: HttpStatusCode.NoContent,
            });
          }
          return res.data;
        })
        .catch((err) => {
          const { code } = err;
          setErrorMessage(codeMapping(code));
          return err;
        })
        .finally(() => setIsLoading(false));
    });

    return Promise.all(allBoardData);
  };
  return {
    getBoardInfo,
    errorMessage,
    isLoading,
  };
};
