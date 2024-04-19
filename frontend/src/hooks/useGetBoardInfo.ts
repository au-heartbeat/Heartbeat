import { AXIOS_REQUEST_ERROR_CODE, BOARD_CONFIG_INFO_ERROR, BOARD_CONFIG_INFO_TITLE } from '@src/constants/resources';
import { boardInfoClient } from '@src/clients/board/BoardInfoClient';
import { BoardInfoConfigDTO } from '@src/clients/board/dto/request';
import { BOARD_INFO_FAIL_STATUS } from '@src/constants/commons';
import { ReactNode, useEffect, useState } from 'react';
import { AxiosResponse, HttpStatusCode } from 'axios';
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
  getBoardInfo: (data: BoardInfoConfigDTO) => Promise<Awaited<AxiosResponse<BoardInfoResponse>[]> | undefined>;
  isLoading: boolean;
  errorMessage: Record<string, ReactNode>;
  isDataLoading: boolean;
  boardInfoFailedStatus: BOARD_INFO_FAIL_STATUS;
}
const boardInfoFailedStatusMapping = (code: string | number) => {
  const numericCode = typeof code === 'string' ? parseInt(code, 10) : code;
  if (numericCode >= HttpStatusCode.BadRequest || numericCode < HttpStatusCode.InternalServerError) {
    return BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_4XX;
  } else {
    return BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_TIMEOUT;
  }
};

const errorStatusMap = (status: BOARD_INFO_FAIL_STATUS) => {
  const errorStatusMap = {
    [BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_4XX]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
        message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
        code: HttpStatusCode.BadRequest,
      },
      newStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_4XX,
    },
    [BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_TIMEOUT]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.EMPTY,
        message: BOARD_CONFIG_INFO_ERROR.RETRY,
        code: AXIOS_REQUEST_ERROR_CODE.TIMEOUT,
      },
      newStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_TIMEOUT,
    },
    [BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_NO_CARDS]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.EMPTY,
        message: BOARD_CONFIG_INFO_ERROR.RETRY,
        code: AXIOS_REQUEST_ERROR_CODE.NO_CARDS,
      },
      newStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_NO_CARDS,
    },
    [BOARD_INFO_FAIL_STATUS.ALL_FAILED_NO_CARDS]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.NO_CONTENT,
        message: BOARD_CONFIG_INFO_ERROR.NOT_CONTENT,
        code: AXIOS_REQUEST_ERROR_CODE.NO_CARDS,
      },
      newStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_NO_CARDS,
    },
  };
  return get(errorStatusMap, status);
};

export const useGetBoardInfoEffect = (): useGetBoardInfoInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState({});
  const [boardInfoFailedStatus, setBoardInfoFailedStatus] = useState(BOARD_INFO_FAIL_STATUS.NOT_FAILED);
  useEffect(() => {
    console.log('boardInfoFailedStatus--hook' + boardInfoFailedStatus);
  }, [boardInfoFailedStatus]);

  const getBoardInfo = async (data: BoardInfoConfigDTO) => {
    setIsLoading(true);
    setErrorMessage({});
    let errorCount = 0;
    let localBoardInfoFailedStatus: BOARD_INFO_FAIL_STATUS;

    if (data.dateRanges) {
      const dateRangeCopy = Array.from(data.dateRanges);
      dateRangeCopy.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());
      const allBoardData = dateRangeCopy.map((info) => {
        const request = {
          token: data.token,
          type: data.type,
          site: data.site,
          email: data.email,
          boardId: data.boardId,
          projectKey: data.projectKey,
        };
        const boardInfoRequest = {
          ...request,
          startTime: dayjs(info.startDate).valueOf().toString(),
          endTime: dayjs(info.endDate).valueOf().toString(),
        };

        return boardInfoClient
          .getBoardInfo(boardInfoRequest)
          .then((res) => {
            if (!res.data) {
              errorCount++;
              localBoardInfoFailedStatus = BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_NO_CARDS;
              setBoardInfoFailedStatus(BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_NO_CARDS);
            }
            return res;
          })
          .catch((err) => {
            const { code } = err;
            errorCount++;
            localBoardInfoFailedStatus = boardInfoFailedStatusMapping(code);
            console.log('localBoardInfoFailedStatus' + localBoardInfoFailedStatus);
            setBoardInfoFailedStatus(localBoardInfoFailedStatus);
            return err;
          });
      });

      return Promise.all(allBoardData)
        .then((res) => {
          if (localBoardInfoFailedStatus == BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_NO_CARDS) {
            localBoardInfoFailedStatus = BOARD_INFO_FAIL_STATUS.ALL_FAILED_NO_CARDS;
          }
          const config = errorStatusMap(localBoardInfoFailedStatus);
          console.log(res);
          console.log('errorCount' + errorCount);
          console.log('config' + config);
          if (errorCount == res.length) {
            if (config) {
              console.log('all failed');
              setErrorMessage(config.errorMessage);
              setBoardInfoFailedStatus(config.newStatus);
            }
          } else if (errorCount != 0) {
            console.log('partial failed');
            if (config) {
              setErrorMessage(config.errorMessage);
            }
          }

          return res;
        })
        .finally(() => {
          setIsLoading(false);
          setIsDataLoading(false);
        });
    }
  };
  return {
    getBoardInfo,
    errorMessage,
    isLoading,
    isDataLoading,
    boardInfoFailedStatus,
  };
};
