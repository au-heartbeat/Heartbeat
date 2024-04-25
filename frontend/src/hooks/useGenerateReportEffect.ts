import { ReportCallbackResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import { exportValidityTimeMapper } from '@src/hooks/reportMapper/exportValidityTime';
import { DATA_LOADING_FAILED, DEFAULT_MESSAGE } from '@src/constants/resources';
import { IPollingRes, reportClient } from '@src/clients/report/ReportClient';
import { DateRange, selectConfig } from '@src/context/config/configSlice';
import { ReportRequestDTO } from '@src/clients/report/dto/request';
import { formatDateToTimestampString } from '@src/utils/util';
import { TimeoutError } from '@src/errors/TimeoutError';
import { METRIC_TYPES } from '@src/constants/commons';
import { useAppSelector } from '@src/hooks/index';
import { useRef, useState } from 'react';
import get from 'lodash/get';

export type PromiseSettledResultWithId<T> = PromiseSettledResult<T> & {
  id: string;
};

export interface useGenerateReportEffectInterface {
  startToRequestData: (params: ReportRequestDTO) => void;
  stopPollingReports: () => void;
  result: IReportInfo[];
}

interface IReportError {
  timeout4Board: string;
  timeout4Dora: string;
  timeout4Report: string;
  generalError4Board: string;
  generalError4Dora: string;
  generalError4Report: string;
}

export interface IReportInfo extends IReportError {
  id: string;
  reportData: ReportResponseDTO | undefined;
}

export const initReportInfo: IReportInfo = {
  id: '',
  timeout4Board: '',
  timeout4Dora: '',
  timeout4Report: '',
  generalError4Board: '',
  generalError4Dora: '',
  generalError4Report: '',
  reportData: undefined,
};

const timeoutErrorKey = {
  [METRIC_TYPES.BOARD]: 'timeout4Board',
  [METRIC_TYPES.DORA]: 'timeout4Dora',
  [METRIC_TYPES.ALL]: 'timeout4Report',
};

const generalErrorKey = {
  [METRIC_TYPES.BOARD]: 'generalError4Board',
  [METRIC_TYPES.DORA]: 'generalError4Dora',
  [METRIC_TYPES.ALL]: 'generalError4Report',
};

const getErrorKey = (error: Error, source: METRIC_TYPES): string => {
  return error instanceof TimeoutError ? timeoutErrorKey[source] : generalErrorKey[source];
};

export const useGenerateReportEffect = (): useGenerateReportEffectInterface => {
  const reportPath = '/reports';
  const configData = useAppSelector(selectConfig);
  const timerIdRef = useRef<number>();
  const dateRanges: DateRange = get(configData, 'basic.dateRange', []);
  const [reportInfos, setReportInfos] = useState<IReportInfo[]>(
    dateRanges.map((dateRange) => ({ ...initReportInfo, id: dateRange?.startDate || '' })),
  );
  let hasPollingStarted = false;

  const startToRequestData = async (params: ReportRequestDTO) => {
    const { metricTypes } = params;
    resetTimeoutMessage(metricTypes);
    const res: PromiseSettledResult<ReportCallbackResponse>[] = await Promise.allSettled(
      dateRanges.map(({ startDate, endDate }) =>
        reportClient.retrieveByUrl(
          {
            ...params,
            startTime: formatDateToTimestampString(startDate!),
            endTime: formatDateToTimestampString(endDate!),
          },
          reportPath,
        ),
      ),
    );

    updateResultAfterFetchReport(res, metricTypes);

    if (hasPollingStarted) return;
    hasPollingStarted = true;

    const { pollingInfos, pollingInterval } = assemblePollingParams(res);

    await pollingReport({ pollingInfos, interval: pollingInterval });
  };

  const pollingReport = async ({
    pollingInfos,
    interval,
  }: {
    pollingInfos: Record<string, string>[];
    interval: number;
  }) => {
    if (pollingInfos.length === 0) {
      stopPollingReports();
      return;
    }
    const pollingIds: string[] = pollingInfos.map((pollingInfo) => pollingInfo.id);
    setReportInfos((preInfos) => {
      return preInfos.map((info) => {
        if (pollingIds.includes(info.id)) {
          info.timeout4Report = DEFAULT_MESSAGE;
        }
        return info;
      });
    });

    const pollingQueue: Promise<IPollingRes>[] = pollingInfos.map((pollingInfo) =>
      reportClient.polling(pollingInfo.callbackUrl),
    );
    const pollingResponses = await Promise.allSettled(pollingQueue);
    const pollingResponsesWithId: PromiseSettledResultWithId<IPollingRes>[] = pollingResponses.map(
      (singleRes, index) => ({
        ...singleRes,
        id: pollingInfos[index].id,
      }),
    );
    const nextPollingInfos: Record<string, string>[] = [];
    setReportInfos((preReportInfos) => {
      return preReportInfos.map((singleResult) => {
        const matchedRes = pollingResponsesWithId.find(
          (singleRes) => singleRes.id === singleResult.id,
        ) as PromiseSettledResultWithId<IPollingRes>;

        if (matchedRes.status === 'fulfilled') {
          const { response } = matchedRes.value;
          singleResult.reportData = assembleReportData(response);
          if (response.allMetricsCompleted || !hasPollingStarted) {
            // todo 这一条不再polling
          } else {
            // todo 继续polling
            nextPollingInfos.push(pollingInfos.find((pollingInfo) => pollingInfo.id === matchedRes.id)!);
          }
        } else {
          const errorKey = getErrorKey(matchedRes.reason, METRIC_TYPES.ALL) as keyof IReportError;
          singleResult[errorKey] = DATA_LOADING_FAILED;
          // todo 这一条不再polling
        }
        return singleResult;
      });
    });
    timerIdRef.current = window.setTimeout(() => {
      pollingReport({ pollingInfos: nextPollingInfos, interval });
    }, interval * 1000);
  };

  const stopPollingReports = () => {
    window.clearTimeout(timerIdRef.current);
    hasPollingStarted = false;
  };

  const assembleReportData = (response: ReportResponseDTO) => {
    const exportValidityTime = exportValidityTimeMapper(response.exportValidityTime);
    return { ...response, exportValidityTime: exportValidityTime };
  };

  const resetTimeoutMessage = (metricTypes: string[]) => {
    if (metricTypes.length === 2) {
      setReportInfos((preReportInfos) => {
        return preReportInfos.map((singleResult) => {
          singleResult.timeout4Report = DEFAULT_MESSAGE;
          return singleResult;
        });
      });
    } else if (metricTypes.includes(METRIC_TYPES.BOARD)) {
      setReportInfos((preReportInfos) => {
        return preReportInfos.map((singleResult) => {
          singleResult.timeout4Board = DEFAULT_MESSAGE;
          return singleResult;
        });
      });
    } else {
      setReportInfos((preReportInfos) => {
        return preReportInfos.map((singleResult) => {
          singleResult.timeout4Dora = DEFAULT_MESSAGE;
          return singleResult;
        });
      });
    }
  };

  const updateResultAfterFetchReport = (
    res: PromiseSettledResult<ReportCallbackResponse>[],
    metricTypes: METRIC_TYPES[],
  ) => {
    if (res.filter(({ status }) => status === 'rejected').length === 0) return;

    setReportInfos((preReportInfos: IReportInfo[]) => {
      return preReportInfos.map((resInfo, index) => {
        const currentRes = res[index];
        if (currentRes.status === 'rejected') {
          const source: METRIC_TYPES = metricTypes.length === 2 ? METRIC_TYPES.ALL : metricTypes[0];
          const errorKey = getErrorKey(currentRes.reason, source) as keyof IReportError;
          resInfo[errorKey] = DATA_LOADING_FAILED;
        }
        return resInfo;
      });
    });
  };

  function assemblePollingParams(res: PromiseSettledResult<ReportCallbackResponse>[]) {
    const resWithIds: PromiseSettledResultWithId<ReportCallbackResponse>[] = res.map((item, index) => ({
      ...item,
      id: reportInfos[index].id,
    }));

    const fulfilledResponses: PromiseSettledResultWithId<ReportCallbackResponse>[] = resWithIds.filter(
      ({ status }) => status === 'fulfilled',
    );

    const pollingInfos: Record<string, string>[] = fulfilledResponses.map((v) => {
      return { callbackUrl: (v as PromiseFulfilledResult<ReportCallbackResponse>).value.callbackUrl, id: v.id };
    });

    const pollingInterval = (fulfilledResponses[0] as PromiseFulfilledResult<ReportCallbackResponse>).value.interval;
    return { pollingInfos, pollingInterval };
  }

  return {
    startToRequestData,
    stopPollingReports,
    result: reportInfos,
  };
};
