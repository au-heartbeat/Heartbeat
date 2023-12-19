import { ROUTE } from '@src/constants/router'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { useNavigate } from 'react-router-dom'
import { ErrorNotification } from '@src/components/ErrorNotification'
import React from 'react'
import { ErrorNotificationContainer } from '@src/components/Metrics/ReportStep/style'

const ReportStep = () => {
  const navigate = useNavigate()
  const { isServerError, errorMessage: reportErrorMsg } = useGenerateReportEffect()

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
