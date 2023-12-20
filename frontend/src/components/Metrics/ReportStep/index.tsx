import { ROUTE } from '@src/constants/router'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { useNavigate } from 'react-router-dom'
import { ErrorNotification } from '@src/components/ErrorNotification'
import React from 'react'
import {
  ErrorNotificationContainer,
  SectionContainer,
  StyledLine,
  StyledTitle,
  StyledToggle,
} from '@src/components/Metrics/ReportStep/style'

const MetricsSection = (props: { title: string }) => (
  <SectionContainer>
    <StyledLine />
    <StyledTitle>{props.title}</StyledTitle>
    <StyledToggle>show more</StyledToggle>
  </SectionContainer>
)

const shouldShowDoraMetrics = () => {
  return true
}

const ReportStep = () => {
  const navigate = useNavigate()
  const { isServerError, errorMessage: reportErrorMsg } = useGenerateReportEffect()

  return (
    <>
      {isServerError ? (
        navigate(ROUTE.ERROR_PAGE)
      ) : (
        <>
          {shouldShowDoraMetrics() && <MetricsSection title={'DORA Metrics'} />}
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
