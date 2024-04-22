import { AXIOS_REQUEST_ERROR_CODE, BOARD_CONFIG_INFO_ERROR, BOARD_CONFIG_INFO_TITLE } from '@src/constants/resources';
import { boardInfoClient } from '@src/clients/board/BoardInfoClient';
import { BoardInfoConfigDTO } from '@src/clients/board/dto/request';
import { BOARD_INFO_FAIL_STATUS } from '@src/constants/commons';
import { ReactNode, useState } from 'react';
import { HttpStatusCode } from 'axios';
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
  getBoardInfo: (data: BoardInfoConfigDTO) => Promise<Awaited<BoardInfoResponse[]> | undefined>;
  isLoading: boolean;
  errorMessage: Record<string, ReactNode>;
  boardInfoFailedStatus: BOARD_INFO_FAIL_STATUS;
}
const boardInfoPartialFailedStatusMapping = (code: string | number) => {
  if (code == AXIOS_REQUEST_ERROR_CODE.TIMEOUT) {
    return BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_TIMEOUT;
  }
  const numericCode = typeof code === 'string' ? parseInt(code, 10) : code;
  if (numericCode >= HttpStatusCode.BadRequest || numericCode < HttpStatusCode.InternalServerError) {
    return BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_4XX;
  }
  return BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_4XX;
};

const errorStatusMap = (status: BOARD_INFO_FAIL_STATUS) => {
  const errorStatusMap = {
    [BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_4XX]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
        message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
        code: HttpStatusCode.BadRequest,
      },
      elevateStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_4XX,
    },
    [BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_TIMEOUT]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.EMPTY,
        message: BOARD_CONFIG_INFO_ERROR.RETRY,
        code: AXIOS_REQUEST_ERROR_CODE.TIMEOUT,
      },
      elevateStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_TIMEOUT,
    },
    [BOARD_INFO_FAIL_STATUS.PARTIAL_FAILED_NO_CARDS]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.NO_CONTENT,
        message: BOARD_CONFIG_INFO_ERROR.NOT_CONTENT,
        code: AXIOS_REQUEST_ERROR_CODE.NO_CARDS,
      },
      elevateStatus: BOARD_INFO_FAIL_STATUS.ALL_FAILED_NO_CARDS,
    },
  };
  return get(errorStatusMap, status);
};

export const useGetBoardInfoEffect = (): useGetBoardInfoInterface => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [boardInfoFailedStatus, setBoardInfoFailedStatus] = useState(BOARD_INFO_FAIL_STATUS.NOT_FAILED);

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
            localBoardInfoFailedStatus = boardInfoPartialFailedStatusMapping(code);
            setBoardInfoFailedStatus(localBoardInfoFailedStatus);
            return err;
          });
      });

      return Promise.all(allBoardData)
        .then((res) => {
          const config = errorStatusMap(localBoardInfoFailedStatus);
          if (errorCount == res.length) {
            if (config) {
              setErrorMessage(config.errorMessage);
              setBoardInfoFailedStatus(config.elevateStatus);
            }
          } else if (errorCount != 0) {
            if (config) {
              setErrorMessage(config.errorMessage);
            }
          }
          const data = res.filter((r) => r.data);
          return data?.map((r) => r.data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  return {
    getBoardInfo,
    errorMessage,
    isLoading,
    boardInfoFailedStatus,
  };
};
