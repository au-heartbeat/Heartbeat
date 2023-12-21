import { useRef, useState } from 'react'
import { reportClient } from '@src/clients/report/ReportClient'
import { BoardReportRequestDTO, ReportRequestDTO } from '@src/clients/report/dto/request'
import { UnknownException } from '@src/exceptions/UnkonwException'
import { InternalServerException } from '@src/exceptions/InternalServerException'
import { HttpStatusCode } from 'axios'
import { pipelineReportMapper, sourceControlReportMapper } from '@src/hooks/reportMapper/report'
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response'
import { DURATION } from '@src/constants/commons'

export interface useGenerateReportEffectInterface {
  startPollingReports: (params: ReportRequestDTO) => void
  startPollingBoardReport: (params: BoardReportRequestDTO) => void
  stopPollingReports: () => void
  stopPollingBoardReports: () => void
  isLoading: boolean
  isBoardLoading: boolean
  isServerError: boolean
  isPipelineLoading: boolean
  isSourceControlLoading: boolean
  errorMessage: string
  sourceControlReport: ReportResponse | undefined
  boardReport: ReportResponse | undefined
  pipelineReport: ReportResponse | undefined
}

export const useGenerateReportEffect = (): useGenerateReportEffectInterface => {
  const [isLoading, setIsLoading] = useState(false)
  const [isBoardLoading, setIsBoardLoading] = useState(false)
  const [isPipelineLoading, setIsPipelineLoading] = useState(false)
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(false)
  const [isServerError, setIsServerError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [pipelineReport, setPipelineReport] = useState<ReportResponse>()
  const [sourceControlReport, setSourceControlReport] = useState<ReportResponse>()
  const [boardReport, setBoardReport] = useState<ReportResponse>()
  const boardTimerRef = useRef<NodeJS.Timer>()
  const timerIdRef = useRef<NodeJS.Timer>()

  const startPollingReports = (params: ReportRequestDTO) => {
    setIsLoading(true)
    setIsPipelineLoading(true)
    setIsSourceControlLoading(true)
    Promise.race([
      reportClient.retrieveReportByUrl(params, '/dora-reports'),
      reportClient.retrieveReportByUrl(params, '/board-reports'),
    ])
      .then((res) => pollingReport(res.response.callbackUrl, res.response.interval))
      .catch((e) => {
        const err = e as Error
        if (err instanceof InternalServerException || err instanceof UnknownException) {
          setIsServerError(true)
        } else {
          setErrorMessage(`generate report: ${err.message}`)
          setTimeout(() => {
            setErrorMessage('')
          }, DURATION.ERROR_MESSAGE_TIME)
        }
        stopPollingReports()
      })
  }

  const startPollingBoardReport = (params: BoardReportRequestDTO) => {
    setIsBoardLoading(true)
    reportClient
      .getBorderReport(params)
      .then((res) => pollingBoardReport(res.response.callbackUrl, res.response.interval))
      .catch((e) => {
        const err = e as Error
        if (err instanceof InternalServerException || err instanceof UnknownException) {
          setIsServerError(true)
        } else {
          setErrorMessage(`generate report: ${err.message}`)
          setTimeout(() => {
            setErrorMessage('')
          }, DURATION.ERROR_MESSAGE_TIME)
        }
        stopPollingBoardReports()
      })
  }

  const pollingBoardReport = (url: string, interval: number) => {
    reportClient
      .pollingReport(url)
      .then((res) => {
        if (res.status === HttpStatusCode.Created) {
          stopPollingBoardReports()
          setBoardReport(res.response)
        } else {
          boardTimerRef.current = setTimeout(() => pollingReport(url, interval), interval * 1000)
        }
      })
      .catch((e) => {
        const err = e as Error
        if (err instanceof InternalServerException || err instanceof UnknownException) {
          setIsServerError(true)
        } else {
          setErrorMessage(`generate report: ${err.message}`)
          setTimeout(() => {
            setErrorMessage('')
          }, DURATION.ERROR_MESSAGE_TIME)
        }
        stopPollingBoardReports()
      })
  }

  const pollingReport = (url: string, interval: number) => {
    reportClient
      .pollingReport(url)
      .then((res: { status: number; response: ReportResponseDTO }) => {
        const { sourceControlMetricsReady, pipelineMetricsReady } = res.response
        if (sourceControlMetricsReady) {
          setIsSourceControlLoading(false)
          setSourceControlReport(sourceControlReportMapper(res.response))
        }
        if (pipelineMetricsReady) {
          setIsPipelineLoading(false)
          setPipelineReport(pipelineReportMapper(res.response))
        }
        if (res.status === HttpStatusCode.Created) {
          stopPollingReports()
        } else {
          timerIdRef.current = setTimeout(() => pollingReport(url, interval), interval * 1000)
        }
      })
      .catch((e) => {
        const err = e as Error
        if (err instanceof InternalServerException || err instanceof UnknownException) {
          setIsServerError(true)
        } else {
          setErrorMessage(`generate report: ${err.message}`)
          setTimeout(() => {
            setErrorMessage('')
          }, DURATION.ERROR_MESSAGE_TIME)
        }
        stopPollingReports()
      })
  }

  const stopPollingReports = () => {
    setIsLoading(false)
    clearInterval(timerIdRef.current)
  }

  const stopPollingBoardReports = () => {
    setIsBoardLoading(false)
    clearInterval(boardTimerRef.current)
  }

  return {
    startPollingReports,
    startPollingBoardReport,
    stopPollingReports,
    stopPollingBoardReports,
    sourceControlReport,
    pipelineReport,
    isLoading,
    isPipelineLoading,
    isSourceControlLoading,
    isBoardLoading,
    boardReport,
    isServerError,
    errorMessage,
  }
}
