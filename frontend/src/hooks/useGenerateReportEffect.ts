import { useRef, useState } from 'react'
import { reportClient } from '@src/clients/report/ReportClient'
import { BoardReportRequestDTO, ReportRequestDTO } from '@src/clients/report/dto/request'
import { UnknownException } from '@src/exceptions/UnkonwException'
import { InternalServerException } from '@src/exceptions/InternalServerException'
import { ReportResponseDTO } from '@src/clients/report/dto/response'
import { DURATION, RETRIEVE_REPORT_TYPES } from '@src/constants/commons'
import { exportValidityTimeMapper } from '@src/hooks/reportMapper/exportValidityTime'
import { useAppDispatch } from '@src/hooks/useAppDispatch'
import { updateReportData } from '@src/context/report/reportSlice'
import { ForbiddenException } from '@src/exceptions/ForbiddenException'
import { NotFoundException } from '@src/exceptions/NotFoundException'
import { TimeoutException } from '@src/exceptions/TimeoutException'

export interface useGenerateReportEffectInterface {
  startToRequestBoardData: (boardParams: BoardReportRequestDTO) => void;
  startToRequestDoraData: (doraParams: ReportRequestDTO) => void;
  stopPollingReports: () => void;
  isServerError: boolean;
  errorMessage: string;
  reportData: ReportResponseDTO | undefined;
}

export const useGenerateReportEffect = (): useGenerateReportEffectInterface => {
  const reportPath = '/reports';
  const [isServerError, setIsServerError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reportData, setReportData] = useState<ReportResponseDTO | undefined>();
  const timerIdRef = useRef<number>();
  let hasPollingStarted = false;

  const startToRequestBoardData = (boardParams: ReportRequestDTO) => {
    reportClient
      .retrieveReportByUrl(boardParams, `${reportPath}/${RETRIEVE_REPORT_TYPES.BOARD}`)
      .then((res) => {
        if (hasPollingStarted) return;
        hasPollingStarted = true;
        pollingReport(res.response.callbackUrl, res.response.interval);
      })
      .catch((e) => {
        handleError(e);
        stopPollingReports();
      });
  };

  const handleError = (error: Error) => {
    if (error instanceof ForbiddenException) {
      setErrorMessage('403')
    } else if (error instanceof NotFoundException) {
      setErrorMessage('404')
    } else if (error instanceof InternalServerException || error instanceof TimeoutException) {
      setIsServerError(true)
    } else {
      setErrorMessage('timeout')
    }
  };

  const startToRequestDoraData = (doraParams: ReportRequestDTO) => {
    reportClient
      .retrieveReportByUrl(doraParams, `${reportPath}/${RETRIEVE_REPORT_TYPES.DORA}`)
      .then((res) => {
        if (hasPollingStarted) return;
        hasPollingStarted = true;
        pollingReport(res.response.callbackUrl, res.response.interval);
      })
      .catch((e) => {
        handleError(e);
        stopPollingReports();
      });
  };

  const pollingReport = (url: string, interval: number) => {
    reportClient
      .pollingReport(url)
      .then((res: { status: number; response: ReportResponseDTO }) => {
        const response = res.response;
        handleAndUpdateData(response);
        if (response.isAllMetricsReady) {
          stopPollingReports();
        } else {
          timerIdRef.current = window.setTimeout(() => pollingReport(url, interval), interval * 1000);
        }
      })
      .catch((e) => {
        handleError(e);
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
    startToRequestBoardData,
    startToRequestDoraData,
    stopPollingReports,
    reportData,
    isServerError,
    errorMessage,
  };
};
