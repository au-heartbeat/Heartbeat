import { ROUTE } from '@src/constants/router'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { useNavigate } from 'react-router-dom'
import { ErrorNotification } from '@src/components/ErrorNotification'
import React, { useEffect } from 'react'
import { ErrorNotificationContainer } from '@src/components/Metrics/ReportStep/style'
import { BoardReportRequestDTO } from '@src/clients/report/dto/request'
import dayjs from 'dayjs'
import { CALENDAR } from '@src/constants/resources'
import { filterAndMapCycleTimeSettings, getJiraBoardToken } from '@src/utils/util'
import { useAppSelector } from '@src/hooks'
import { selectMetricsContent } from '@src/context/Metrics/metricsSlice'
import { selectTimeStamp } from '@src/context/stepper/StepperSlice'
import { selectConfig, selectJiraColumns } from '@src/context/config/configSlice'

const ReportStep = () => {
  const navigate = useNavigate()
  const configData = useAppSelector(selectConfig)
  const csvTimeStamp = useAppSelector(selectTimeStamp)
  const { cycleTimeSettings, treatFlagCardAsBlock, users, targetFields, doneColumn, assigneeFilter } =
    useAppSelector(selectMetricsContent)
  const jiraColumns = useAppSelector(selectJiraColumns)

  const { board } = configData
  const { metrics, calendarType, dateRange } = configData.basic
  const { startDate, endDate } = dateRange
  const { token, type, site, projectKey, boardId, email } = board.config

  const { isServerError, errorMessage: reportErrorMsg, startPollingBoardReport } = useGenerateReportEffect()

  const jiraToken = getJiraBoardToken(token, email)
  const jiraColumnsWithValue = jiraColumns?.map(
    (obj: { key: string; value: { name: string; statuses: string[] } }) => obj.value
  )

  const getBoardReportRequestBody = (): BoardReportRequestDTO => ({
    metrics: metrics,
    startTime: dayjs(startDate).valueOf().toString(),
    endTime: dayjs(endDate).valueOf().toString(),
    considerHoliday: calendarType === CALENDAR.CHINA,
    jiraBoardSetting: {
      token: jiraToken,
      type: type.toLowerCase().replace(' ', '-'),
      site,
      projectKey,
      boardId,
      boardColumns: filterAndMapCycleTimeSettings(cycleTimeSettings, jiraColumnsWithValue),
      treatFlagCardAsBlock,
      users,
      assigneeFilter,
      targetFields,
      doneColumn,
    },
    csvTimeStamp: csvTimeStamp,
  })

  useEffect(() => {
    startPollingBoardReport(getBoardReportRequestBody())
  }, [])

  return (
    <>
      {isServerError ? (
        navigate(ROUTE.ERROR_PAGE)
      ) : (
        <>
          {reportErrorMsg && (
            <ErrorNotificationContainer>
              <ErrorNotification message={reportErrorMsg} />
            </ErrorNotificationContainer>
          )}
        </>
      )}
    </>
  )
}

export default ReportStep
