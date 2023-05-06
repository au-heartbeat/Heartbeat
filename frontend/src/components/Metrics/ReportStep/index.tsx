import { useCallback, useEffect, useState } from 'react'
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect'
import { Loading } from '@src/components/Loading'
import { useAppSelector } from '@src/hooks'
import { selectConfig } from '@src/context/config/configSlice'
import {
  CHINA_CALENDAR,
  INIT_REPORT_DATA_WITH_THREE_COLUMNS,
  INIT_REPORT_DATA_WITH_TWO_COLUMNS,
  NAME,
  PIPELINE_STEP,
} from '@src/constants'
import ReportForTwoColumns from '@src/components/Common/ReportForTwoColumns'
import ReportForThreeColumns from '@src/components/Common/ReportForThreeColumns'
import { ReportRequestDTO } from '@src/clients/report/dto/request'
import { IPipelineConfig, selectMetricsContent } from '@src/context/Metrics/metricsSlice'
import dayjs from 'dayjs'
import { ReportDataWithThreeColumns, ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure'

export const ReportStep = () => {
  const { generateReport, isLoading } = useGenerateReportEffect()
  const [velocityData, setVelocityData] = useState({ value: INIT_REPORT_DATA_WITH_TWO_COLUMNS, isShow: false })
  const [cycleTimeData, setCycleTimeData] = useState({ value: INIT_REPORT_DATA_WITH_TWO_COLUMNS, isShow: false })
  const [classificationData, setClassificationData] = useState({
    value: INIT_REPORT_DATA_WITH_THREE_COLUMNS,
    isShow: false,
  })
  const [deploymentFrequencyData, setDeploymentFrequencyData] = useState({
    value: INIT_REPORT_DATA_WITH_THREE_COLUMNS,
    isShow: false,
  })
  const [leadTimeForChangesData, setLeadTimeForChangesData] = useState({
    value: INIT_REPORT_DATA_WITH_THREE_COLUMNS,
    isShow: false,
  })
  const [changeFailureRateData, setChangeFailureRateData] = useState({
    value: INIT_REPORT_DATA_WITH_THREE_COLUMNS,
    isShow: false,
  })
  const configData = useAppSelector(selectConfig)
  const {
    boardColumns,
    treatFlagCardAsBlock,
    users,
    targetFields,
    doneColumn,
    deploymentFrequencySettings,
    leadTimeForChanges,
  } = useAppSelector(selectMetricsContent)
  const { metrics, calendarType, dateRange } = configData.basic
  const { board, pipelineTool, sourceControl } = configData
  const { token, type, site, projectKey, boardId } = board.config

  const getPipelineConfig = (pipelineConfigs: IPipelineConfig[]) => {
    if (!pipelineConfigs[0].organization && pipelineConfigs.length === 1) {
      return []
    }
    return pipelineConfigs.map(({ organization, pipelineName, step }) => {
      const pipelineConfigFromPipelineList = configData.pipelineTool.verifiedResponse.pipelineList.find(
        (pipeline) => pipeline.name === pipelineName && pipeline.orgName === organization
      )
      if (pipelineConfigFromPipelineList != undefined) {
        const { orgName, orgId, name, id, repository } = pipelineConfigFromPipelineList
        return {
          orgId,
          orgName,
          id,
          name,
          step,
          repository,
        }
      }
    }) as { id: string; name: string; orgId: string; orgName: string; repository: string; step: string }[]
  }
  const getReportRequestBody = (): ReportRequestDTO => ({
    metrics: metrics,
    startTime: dayjs(dateRange.startDate).valueOf().toString(),
    endTime: dayjs(dateRange.endDate).valueOf().toString(),
    considerHoliday: calendarType === CHINA_CALENDAR,
    buildKiteSetting: {
      ...pipelineTool.config,
      deployment: getPipelineConfig(deploymentFrequencySettings),
    },
    codebaseSetting: {
      type: sourceControl.config.type,
      token: sourceControl.config.token,
      leadTime: getPipelineConfig(leadTimeForChanges),
    },
    jiraBoardSetting: {
      token,
      type,
      site,
      projectKey,
      boardId,
      boardColumns,
      treatFlagCardAsBlock,
      users,
      targetFields,
      doneColumn,
    },
  })

  const fetchReportData: () => Promise<
    | {
        velocityList?: ReportDataWithTwoColumns[]
        cycleTimeList?: ReportDataWithTwoColumns[]
        classificationList?: ReportDataWithThreeColumns[]
        deploymentFrequencyList?: ReportDataWithThreeColumns[]
        leadTimeForChangesList?: ReportDataWithThreeColumns[]
        changeFailureRateList?: ReportDataWithThreeColumns[]
      }
    | undefined
  > = useCallback(async () => {
    const res = await generateReport(getReportRequestBody())
    return res
  }, [])

  useEffect(() => {
    fetchReportData().then((res) => {
      res?.velocityList && setVelocityData({ ...velocityData, value: res.velocityList, isShow: true })
      res?.cycleTimeList && setCycleTimeData({ ...cycleTimeData, value: res.cycleTimeList, isShow: true })
      res?.classificationList && setClassificationData({ value: res.classificationList, isShow: true })
      res?.deploymentFrequencyList &&
        setDeploymentFrequencyData({
          ...deploymentFrequencyData,
          value: res.deploymentFrequencyList,
          isShow: true,
        })
      res?.changeFailureRateList &&
        setChangeFailureRateData({
          ...changeFailureRateData,
          value: res.changeFailureRateList,
          isShow: true,
        })
      res?.leadTimeForChangesList &&
        setLeadTimeForChangesData({
          ...leadTimeForChangesData,
          value: res.leadTimeForChangesList,
          isShow: true,
        })
    })
  }, [fetchReportData])

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {velocityData.isShow && <ReportForTwoColumns title={'Velocity'} data={velocityData.value} />}
          {cycleTimeData.isShow && <ReportForTwoColumns title={'Cycle time'} data={cycleTimeData.value} />}
          {classificationData.isShow && (
            <ReportForThreeColumns
              title={'Classifications'}
              fieldName='Field Name'
              listName='Subtitle'
              data={classificationData.value}
            />
          )}
          {deploymentFrequencyData.isShow && (
            <ReportForThreeColumns
              title={'Deployment frequency'}
              fieldName={PIPELINE_STEP}
              listName={NAME}
              data={deploymentFrequencyData.value}
            />
          )}
          {leadTimeForChangesData.isShow && (
            <ReportForThreeColumns
              title={'Lead time for changes'}
              fieldName={PIPELINE_STEP}
              listName={NAME}
              data={leadTimeForChangesData.value}
            />
          )}
          {changeFailureRateData.isShow && (
            <ReportForThreeColumns
              title={'Change failure rate'}
              fieldName={PIPELINE_STEP}
              listName={NAME}
              data={changeFailureRateData.value}
            />
          )}
        </>
      )}
    </>
  )
}
