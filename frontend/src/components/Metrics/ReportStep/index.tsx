import React, { useEffect, useState } from 'react'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { Loading } from '@src/components/Loading'
import { useAppSelector } from '@src/hooks'
import { selectConfig } from '@src/context/config/configSlice'
import { reportResponseMapper } from '@src/mapper/ReportMapper'
import {
  INIT_CYCLETIME_METRICS,
  INIT_VELOCITY_METRICS,
  INIT_CLASSIFICATION_METRICS,
  NAME,
  PIPELINE_STEP,
  INIT_DEPLOYMENT_METRICS,
  INIT_LEAD_TIME_FOR_CHANGES_METRICS,
  CHANGE_FAILURE_RATE_METRICS,
} from '@src/constants'
import ReportForThreeColumns from '@src/components/Common/ReportForThreeColumns'
import ReportForTwoColumns from '@src/components/Common/ReportForTwoColumns'

export const ReportStep = () => {
  const { generateReport, isLoading } = useGenerateReportEffect()
  const [velocityData, setVelocityData] = useState(INIT_VELOCITY_METRICS)
  const [cycleTimeData, setCycleTimeData] = useState(INIT_CYCLETIME_METRICS)
  const [classificationData, setClassificationData] = useState(INIT_CLASSIFICATION_METRICS)
  const [deploymentFrequencyData, setDeploymentFrequencyData] = useState(INIT_DEPLOYMENT_METRICS)
  const [leadTimeForChangesData, setLeadTimeForChangesData] = useState(INIT_LEAD_TIME_FOR_CHANGES_METRICS)
  const [changeFailureRateData, setChangeFailureRateData] = useState(CHANGE_FAILURE_RATE_METRICS)
  const configData = useAppSelector(selectConfig)
  const { metrics, calendarType, dateRange } = configData.basic
  const { board, pipelineTool, sourceControl } = configData
  const params = {
    metrics: metrics,
    pipeline: pipelineTool.config,
    board: board.config,
    sourceControl: sourceControl.config,
    calendarType: calendarType,
    startTime: dateRange.startDate,
    endTime: dateRange.endDate,
  }
  useEffect(() => {
    generateReport(params).then((res) => {
      if (res) {
        const reportData = reportResponseMapper(res.response)
        setVelocityData(reportData.velocityValues)
        setCycleTimeData(reportData.cycleValues)
        setClassificationData(reportData.classificationValues)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ReportForTwoColumns title={'Velocity'} data={velocityData} />
          <ReportForTwoColumns title={'Cycle time'} data={cycleTimeData} />
          <ReportForThreeColumns
            title={'Classification'}
            fieldName='Field Name'
            listName='Subtitle'
            data={classificationData}
          />
          <ReportForThreeColumns
            title={'Deployment Frequency'}
            fieldName={PIPELINE_STEP}
            listName={NAME}
            data={deploymentFrequencyData}
          />
          <ReportForThreeColumns
            title={'Lead Time For Change'}
            fieldName={PIPELINE_STEP}
            listName={NAME}
            data={leadTimeForChangesData}
          />
          <ReportForThreeColumns
            title={'Change Failure Rate'}
            fieldName={PIPELINE_STEP}
            listName={NAME}
            data={changeFailureRateData}
          />
        </>
      )}
    </>
  )
}
