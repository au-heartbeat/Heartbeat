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
import { UnauthorizedException } from '@src/exceptions/UnauthorizedException'

export interface useGenerateReportEffectInterface {
  startToRequestBoardData: (boardParams: BoardReportRequestDTO) => void
  startToRequestDoraData: (doraParams: ReportRequestDTO) => void
  stopPollingReports: () => void
  isServerError: boolean
  errorMessage4Dora: string
  errorMessage4Board: string
  reportData: ReportResponseDTO | undefined
}

export const useGenerateReportEffect = (): useGenerateReportEffectInterface => {
  const reportPath = '/reports'
  const dispatch = useAppDispatch()
  const [isServerError, setIsServerError] = useState(false)
  const [errorMessage4Dora, setErrorMessage4Dora] = useState('')
  const [errorMessage4Board, setErrorMessage4Board] = useState('')
  const [reportData, setReportData] = useState<ReportResponseDTO>()
  const timerIdRef = useRef<number>()
  let hasPollingStarted = false

  const startToRequestBoardData = (boardParams: ReportRequestDTO) => {
    reportClient
      .retrieveReportByUrl(boardParams, `${reportPath}/${RETRIEVE_REPORT_TYPES.BOARD}`)
      .then((res) => {
        if (hasPollingStarted) return
        hasPollingStarted = true
        setErrorMessage4Board('')
        pollingReport(res.response.callbackUrl, res.response.interval, 'Jira')
      })
      .catch((e) => {
        handleError(e, 'Jira')
        stopPollingReports()
      })
  }

  const handleError = (error: Error, source: string) => {
    const setErrorMessage = source === 'Dora' ? setErrorMessage4Dora : setErrorMessage4Board
    if (error instanceof ForbiddenException) {
      setErrorMessage(`Failed to get ${source} info_status: 403…`)
    } else if (error instanceof UnauthorizedException) {
      setErrorMessage(`Failed to get ${source} info_status: 401…`)
    } else if (error instanceof NotFoundException) {
      setErrorMessage(`Failed to get ${source} info_status: 404…`)
    } else if (error instanceof InternalServerException || error instanceof TimeoutException) {
      setIsServerError(true)
    } else {
      setErrorMessage('Data loading failed')
    }
  };

  const startToRequestDoraData = (doraParams: ReportRequestDTO) => {
    reportClient
      .retrieveReportByUrl(doraParams, `${reportPath}/${RETRIEVE_REPORT_TYPES.DORA}`)
      .then((res) => {
        if (hasPollingStarted) return
        hasPollingStarted = true
        setErrorMessage4Dora('')
        pollingReport(res.response.callbackUrl, res.response.interval, 'Dora')
      })
      .catch((e) => {
        handleError(e, 'Dora')
        stopPollingReports()
      })
  }

  const pollingReport = (url: string, interval: number, source: string) => {
    reportClient
      .pollingReport(url)
      .then((res: { status: number; response: ReportResponseDTO }) => {
        const response = res.response;
        handleAndUpdateData(response);
        if (response.isAllMetricsReady) {
          stopPollingReports();
        } else {
          timerIdRef.current = window.setTimeout(() => pollingReport(url, interval, source), interval * 1000)
        }
      })
      .catch((e) => {
        handleError(e, source)
        stopPollingReports()
      })
  }

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
    errorMessage4Dora,
    errorMessage4Board,
  }
}
