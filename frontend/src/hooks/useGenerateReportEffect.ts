import { IBasicReportRequestDTO, ReportRequestDTO } from '@src/clients/report/dto/request';
import { exportValidityTimeMapper } from '@src/hooks/reportMapper/exportValidityTime';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { reportClient } from '@src/clients/report/ReportClient';
import { DATA_LOADING_FAILED } from '@src/constants/resources';
import { TimeoutError } from '@src/errors/TimeoutError';
import { METRIC_TYPES } from '@src/constants/commons';
import { useRef, useState } from 'react';

export interface useGenerateReportEffectInterface {
  startToRequestData: (boardParams: IBasicReportRequestDTO) => void;
  startToRequestDoraData: (doraParams: ReportRequestDTO) => void;
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
  const [timeout4Board, setTimeout4Board] = useState('');
  const [timeout4Dora, setTimeout4Dora] = useState('');
  const [timeout4Report, setTimeout4Report] = useState('');
  const [generalError4Board, setGeneralError4Board] = useState('');
  const [generalError4Dora, setGeneralError4Dora] = useState('');
  const [generalError4Report, setGeneralError4Report] = useState('');
  const [reportData, setReportData] = useState<ReportResponseDTO | undefined>();
  const timerIdRef = useRef<number>();
  let hasPollingStarted = false;

  const startToRequestData = (boardParams: ReportRequestDTO) => {
    const { metricTypes } = boardParams;
    setTimeout4Board('');
    reportClient
      .retrieveByUrl(boardParams, `${reportPath}`)
      .then((res) => {
        if (hasPollingStarted) return;
        hasPollingStarted = true;
        pollingReport(res.response.callbackUrl, res.response.interval);
      })
      .catch((e) => {
        const source = metricTypes.length === 2 ? 'all' : metricTypes[0];
        handleError(e, source);
      });
  };

  const handleError = (error: Error, source: string) => {
    if (error instanceof TimeoutError) {
      if (source === 'board') {
        setTimeout4Board(DATA_LOADING_FAILED);
      } else if (source === 'dora') {
        setTimeout4Dora(DATA_LOADING_FAILED);
      } else {
        setTimeout4Report(DATA_LOADING_FAILED);
      }
    } else {
      if (source === 'board') {
        setGeneralError4Board(DATA_LOADING_FAILED);
      } else if (source === 'dora') {
        setGeneralError4Dora(DATA_LOADING_FAILED);
      } else {
        setGeneralError4Report(DATA_LOADING_FAILED);
      }
    }
  };

  const startToRequestDoraData = (doraParams: ReportRequestDTO) => {
    setTimeout4Dora('');
    reportClient
      .retrieveByUrl(doraParams, `${reportPath}`)
      .then((res) => {
        if (hasPollingStarted) return;
        hasPollingStarted = true;
        pollingReport(res.response.callbackUrl, res.response.interval);
      })
      .catch((e) => {
        handleError(e, 'dora');
      });
  };

  const pollingReport = (url: string, interval: number) => {
    setTimeout4Report('');
    reportClient
      .polling(url)
      .then((res: { status: number; response: ReportResponseDTO }) => {
        const response = res.response;
        handleAndUpdateData(response);
        if (response.allMetricsCompleted || !hasPollingStarted) {
          stopPollingReports();
        } else {
          timerIdRef.current = window.setTimeout(() => pollingReport(url, interval), interval * 1000);
        }
      })
      .catch((e) => {
        handleError(e, 'all');
        stopPollingReports();
      });
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
    startToRequestDoraData,
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
