import {
  ChangeFailureRateResp,
  ClassificationResp,
  CycleTimeResp,
  DeploymentFrequencyResp,
  LeadTimeForChangesResp,
  VelocityResp,
} from '@src/clients/report/dto/responseDTO'

import { changeFailureRateMapper } from '@src/hooks/reportMapper/changeFailureRate'
import { velocityMapper } from '@src/hooks/reportMapper/velocity'
import { cycleTimeMapper } from '@src/hooks/reportMapper/cycleTime'
import { classificationMapper } from '@src/hooks/reportMapper/classification'
import { deploymentFrequencyMapper } from '@src/hooks/reportMapper/deploymentFrequency'
import { leadTimeForChangesMapper } from '@src/hooks/reportMapper/leadTimeForChanges'
import { ReportDataWithThreeColumns, ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure'

export const reportMapper = ({
  velocity,
  cycleTime,
  classification,
  deploymentFrequency,
  leadTimeForChanges,
  changeFailureRate,
}: {
  velocity: VelocityResp
  cycleTime: CycleTimeResp
  classification: Array<ClassificationResp>
  deploymentFrequency: DeploymentFrequencyResp
  leadTimeForChanges: LeadTimeForChangesResp
  changeFailureRate: ChangeFailureRateResp
}): {
  velocityValues: ReportDataWithTwoColumns[]
  cycleValues: ReportDataWithTwoColumns[]
  classificationValues: ReportDataWithThreeColumns[]
  deploymentFrequencyValues: ReportDataWithThreeColumns[]
  leadTimeForChangesValues: ReportDataWithThreeColumns[]
  changeFailureRateValues: ReportDataWithThreeColumns[]
} => {
  // const { velocity, cycleTime, classification, deploymentFrequency, leadTimeForChanges, changeFailureRate } = response

  const velocityValues = velocityMapper(velocity)

  const cycleValues = cycleTimeMapper(cycleTime)

  const classificationValues = classificationMapper(classification)

  const deploymentFrequencyValues = deploymentFrequencyMapper(deploymentFrequency)

  const leadTimeForChangesValues = leadTimeForChangesMapper(leadTimeForChanges)

  const changeFailureRateValues = changeFailureRateMapper(changeFailureRate)

  return {
    velocityValues,
    cycleValues,
    classificationValues,
    deploymentFrequencyValues,
    leadTimeForChangesValues,
    changeFailureRateValues,
  }
}
