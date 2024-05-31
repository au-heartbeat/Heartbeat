import { AxiosRequestErrorCode, BOARD_CONFIG_INFO_ERROR, BOARD_CONFIG_INFO_TITLE } from '@src/constants/resources';
import { updateMetricsPageFailedTimeRangeInfos } from '@src/context/stepper/StepperSlice';
import { boardInfoClient } from '@src/clients/board/BoardInfoClient';
import { BoardInfoConfigDTO } from '@src/clients/board/dto/request';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { formatDateToTimestampString } from '@src/utils/util';
import { useAppDispatch } from '@src/hooks/index';
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
  boardInfoFailedStatus: MetricsDataFailStatus;
}

const boardInfoPartialFailedStatusMapping = (code: string | number) => {
  if (code == AxiosRequestErrorCode.Timeout) {
    return MetricsDataFailStatus.PartialFailedTimeout;
  }
  const numericCode = code as number;
  if (numericCode >= HttpStatusCode.BadRequest && numericCode < HttpStatusCode.InternalServerError) {
    return MetricsDataFailStatus.PartialFailed4xx;
  }
  return MetricsDataFailStatus.PartialFailed4xx;
};

const errorStatusMap = (status: MetricsDataFailStatus) => {
  const errorStatusMap = {
    [MetricsDataFailStatus.PartialFailed4xx]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.GENERAL_ERROR,
        message: BOARD_CONFIG_INFO_ERROR.GENERAL_ERROR,
        code: HttpStatusCode.BadRequest,
      },
      elevateStatus: MetricsDataFailStatus.AllFailed4xx,
    },
    [MetricsDataFailStatus.PartialFailedTimeout]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.EMPTY,
        message: BOARD_CONFIG_INFO_ERROR.RETRY,
        code: AxiosRequestErrorCode.Timeout,
      },
      elevateStatus: MetricsDataFailStatus.AllFailedTimeout,
    },
    [MetricsDataFailStatus.PartialFailedNoCards]: {
      errorMessage: {
        title: BOARD_CONFIG_INFO_TITLE.NO_CONTENT,
        message: BOARD_CONFIG_INFO_ERROR.NOT_CONTENT,
        code: AxiosRequestErrorCode.NoCards,
      },
      elevateStatus: MetricsDataFailStatus.AllFailedNoCards,
    },
  };
  return get(errorStatusMap, status);
};

export const useGetBoardInfoEffect = (): useGetBoardInfoInterface => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [boardInfoFailedStatus, setBoardInfoFailedStatus] = useState(MetricsDataFailStatus.NotFailed);

  const getBoardInfo = async (data: BoardInfoConfigDTO) => {
    setIsLoading(true);
    setErrorMessage({});
    const localFailedTimeRangeList: string[] = [];
    let errorCount = 0;
    let localBoardInfoFailedStatus: MetricsDataFailStatus;

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
              localBoardInfoFailedStatus = MetricsDataFailStatus.PartialFailedNoCards;
              localFailedTimeRangeList.push(formatDateToTimestampString(info.startDate as string));
              setBoardInfoFailedStatus(MetricsDataFailStatus.PartialFailedNoCards);
            }
            return res;
          })
          .catch((err) => {
            errorCount++;
            localBoardInfoFailedStatus = boardInfoPartialFailedStatusMapping(err?.code);
            localFailedTimeRangeList.push(formatDateToTimestampString(info.startDate as string));
            setBoardInfoFailedStatus(localBoardInfoFailedStatus);
            return err;
          });
      });

      dispatch(
        updateMetricsPageFailedTimeRangeInfos(
          dateRangeCopy.map((dateRange) => ({
            startDate: formatDateToTimestampString(dateRange.startDate!),
            errors: {
              boardInfo: {
                isLoading: true,
                isLoaded: false,
                isLoadedWithError: false,
              },
            },
          })),
        ),
      );

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
          dispatch(
            updateMetricsPageFailedTimeRangeInfos(
              dateRangeCopy.map((dateRange) => ({
                startDate: formatDateToTimestampString(dateRange.startDate!),
                errors: {
                  boardInfo: {
                    isLoading: false,
                    isLoaded: true,
                    isLoadedWithError: localFailedTimeRangeList.includes(
                      formatDateToTimestampString(dateRange.startDate!),
                    ),
                  },
                },
              })),
            ),
          );
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
