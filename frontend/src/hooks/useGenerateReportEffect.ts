import { ReportCallbackResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import { exportValidityTimeMapper } from '@src/hooks/reportMapper/exportValidityTime';
import { DATA_LOADING_FAILED, DEFAULT_MESSAGE } from '@src/constants/resources';
import { ReportRequestDTO } from '@src/clients/report/dto/request';
import { reportClient } from '@src/clients/report/ReportClient';
import { selectConfig } from '@src/context/config/configSlice';
import { formatDateToTimestampString } from '@src/utils/util';
import { TimeoutError } from '@src/errors/TimeoutError';
import { METRIC_TYPES } from '@src/constants/commons';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@src/hooks';
import get from 'lodash/get';
import dayjs from 'dayjs';

export interface useGenerateReportEffectInterface {
  startToRequestData: (params: ReportRequestDTO) => void;
  stopPollingReports: () => void;
  timeout4Board: string;
  timeout4Dora: string;
  timeout4Report: string;
  generalError4Board: string;
  generalError4Dora: string;
  generalError4Report: string;
  reportData: ReportResponseDTO | undefined;
}

export const useGenerateReportEffect = (): useGenerateReportEffectInterface => {
  const reportPath = '/reports';
  const configData = useAppSelector(selectConfig);
  const [timeout4Board, setTimeout4Board] = useState(DEFAULT_MESSAGE);
  const [timeout4Dora, setTimeout4Dora] = useState(DEFAULT_MESSAGE);
  const [timeout4Report, setTimeout4Report] = useState(DEFAULT_MESSAGE);
  const [generalError4Board, setGeneralError4Board] = useState(DEFAULT_MESSAGE);
  const [generalError4Dora, setGeneralError4Dora] = useState(DEFAULT_MESSAGE);
  const [generalError4Report, setGeneralError4Report] = useState(DEFAULT_MESSAGE);
  const [reportData, setReportData] = useState<ReportResponseDTO | undefined>();
  const timerIdRef = useRef<number>();
  const dateRanges = get(configData, 'basic.dateRange', []);
  const [intervalTime, setIntervalTime] = useState<number>(0);
  const [pollingQueue, setPollingQueue] = useState<any[]>([]);

  const startToRequestData = async (params: ReportRequestDTO) => {
    const { metricTypes } = params;
    resetTimeoutMessage(metricTypes);

    return Promise.allSettled(
      dateRanges.map(({ startDate, endDate }) =>
        reportClient.retrieveByUrl(
          {
            ...params,
            startTime: dayjs(startDate).unix().toString(),
            endTime: dayjs(endDate).unix().toString(),
          },
          reportPath,
        ),
      ),
    ).then(async (responses) => {
      console.log(responses);
      if (pollingQueue.length) return;
      const fulfilled = responses.filter(({ status }) => status === 'fulfilled');
      const rejected = responses.filter(({ status }) => status === 'rejected');
      await setIntervalTime(get(fulfilled, '0.value.response.interval', 0));

      await setPollingQueue(fulfilled.map((item) => pollingReport(get(item, 'value.response.callbackUrl', ''))));

      if (rejected.length) {
        const source: METRIC_TYPES = metricTypes.length === 2 ? METRIC_TYPES.ALL : metricTypes[0];
        handleError(get(rejected, '0.reason', new Error()), source);
      }
    });
  };

  useEffect(() => {
    getAllReports(pollingQueue);
  }, [pollingQueue]);

  const getAllReports = (queue: any[]) => {
    Promise.allSettled(queue).then((responses: any) => {
      handleAndUpdateData(get(responses, '0.value.response', {}) as ReportResponseDTO);
      timerIdRef.current = window.setTimeout(() => {
        setPollingQueue(
          responses.filter(
            (response: PromiseSettledResult<any>) =>
              response.status === 'fulfilled' && !get(response, 'value.response.allMetricsCompleted'),
          ),
        );
      }, intervalTime * 1000);
    });
  };

  const resetTimeoutMessage = (metricTypes: string[]) => {
    if (metricTypes.length === 2) {
      setTimeout4Report(DEFAULT_MESSAGE);
    } else if (metricTypes.includes(METRIC_TYPES.BOARD)) {
      setTimeout4Board(DEFAULT_MESSAGE);
    } else {
      setTimeout4Dora(DEFAULT_MESSAGE);
    }
  };

  const handleTimeoutError = {
    [METRIC_TYPES.BOARD]: setTimeout4Board,
    [METRIC_TYPES.DORA]: setTimeout4Dora,
    [METRIC_TYPES.ALL]: setTimeout4Report,
  };

  const handleGeneralError = {
    [METRIC_TYPES.BOARD]: setGeneralError4Board,
    [METRIC_TYPES.DORA]: setGeneralError4Dora,
    [METRIC_TYPES.ALL]: setGeneralError4Report,
  };

  const handleError = (error: Error, source: METRIC_TYPES) => {
    return error instanceof TimeoutError
      ? handleTimeoutError[source](DATA_LOADING_FAILED)
      : handleGeneralError[source](DATA_LOADING_FAILED);
  };

  const pollingReport = (url: string) => {
    setTimeout4Report(DEFAULT_MESSAGE);
    return reportClient.polling(url);
  };

  const stopPollingReports = async () => {
    await setPollingQueue([]);
    window.clearTimeout(timerIdRef.current);
  };

  const handleAndUpdateData = (response: ReportResponseDTO) => {
    const exportValidityTime = exportValidityTimeMapper(response.exportValidityTime);
    setReportData({ ...response, exportValidityTime: exportValidityTime });
  };

  return {
    startToRequestData,
    stopPollingReports,
    reportData,
    timeout4Board,
    timeout4Dora,
    timeout4Report,
    generalError4Board,
    generalError4Dora,
    generalError4Report,
  };
};
