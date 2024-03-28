import { exportValidityTimeMapper } from '@src/hooks/reportMapper/exportValidityTime';
import { DATA_LOADING_FAILED, DEFAULT_MESSAGE } from '@src/constants/resources';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { ReportRequestDTO } from '@src/clients/report/dto/request';
import { reportClient } from '@src/clients/report/ReportClient';
import { TimeoutError } from '@src/errors/TimeoutError';
import { METRIC_TYPES } from '@src/constants/commons';
import { useRef, useState } from 'react';

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
  const [timeout4Board, setTimeout4Board] = useState(DEFAULT_MESSAGE);
  const [timeout4Dora, setTimeout4Dora] = useState(DEFAULT_MESSAGE);
  const [timeout4Report, setTimeout4Report] = useState(DEFAULT_MESSAGE);
  const [generalError4Board, setGeneralError4Board] = useState(DEFAULT_MESSAGE);
  const [generalError4Dora, setGeneralError4Dora] = useState(DEFAULT_MESSAGE);
  const [generalError4Report, setGeneralError4Report] = useState(DEFAULT_MESSAGE);
  const [reportData, setReportData] = useState<ReportResponseDTO | undefined>();
  const timerIdRef = useRef<number>();
  let hasPollingStarted = false;

  const startToRequestData = (params: ReportRequestDTO) => {
    const { metricTypes } = params;
    resetTimeoutMessage(metricTypes);
    reportClient
      .retrieveByUrl(params, reportPath)
      .then((res) => {
        if (hasPollingStarted) return;
        hasPollingStarted = true;
        pollingReport(res.response.callbackUrl, res.response.interval);
      })
      .catch((e) => {
        const source = metricTypes.length === 2 ? METRIC_TYPES.ALL : metricTypes[0];
        handleError(e, source);
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

  const handleError = (error: Error, source: string) => {
    if (error instanceof TimeoutError) {
      if (source === METRIC_TYPES.BOARD) {
        setTimeout4Board(DATA_LOADING_FAILED);
      } else if (source === METRIC_TYPES.DORA) {
        setTimeout4Dora(DATA_LOADING_FAILED);
      } else {
        setTimeout4Report(DATA_LOADING_FAILED);
      }
    } else {
      if (source === METRIC_TYPES.BOARD) {
        setGeneralError4Board(DATA_LOADING_FAILED);
      } else if (source === METRIC_TYPES.DORA) {
        setGeneralError4Dora(DATA_LOADING_FAILED);
      } else {
        setGeneralError4Report(DATA_LOADING_FAILED);
      }
    }
  };

  const pollingReport = (url: string, interval: number) => {
    setTimeout4Report(DEFAULT_MESSAGE);
    reportClient
      .polling(url)
      .then((res: { status: number; response: ReportResponseDTO }) => {
        const response = res.response;
        handleAndUpdateData(response);
        if (!areMetricsLoading(response) || !hasPollingStarted) {
          stopPollingReports();
        } else {
          timerIdRef.current = window.setTimeout(() => pollingReport(url, interval), interval * 1000);
        }
      })
      .catch((e) => {
        handleError(e, METRIC_TYPES.ALL);
        stopPollingReports();
      });
  };

  const areMetricsLoading = (response: ReportResponseDTO) => {
    const { boardMetricsCompleted, doraMetricsCompleted, reportMetricsError } = response;
    const { boardMetricsError, pipelineMetricsError, sourceControlMetricsError } = reportMetricsError;

    const isBoardMetricsLoading = boardMetricsCompleted === false && boardMetricsError === null;
    const isDoraMetricsLoading =
      doraMetricsCompleted === false && pipelineMetricsError === null && sourceControlMetricsError == null;
    return isBoardMetricsLoading || isDoraMetricsLoading;
  };

  const stopPollingReports = () => {
    window.clearTimeout(timerIdRef.current);
    hasPollingStarted = false;
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
