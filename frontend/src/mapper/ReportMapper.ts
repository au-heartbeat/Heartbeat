import {
  ChangeFailureRateResp,
  ClassificationResp,
  CycleTimeResp,
  DeploymentFrequencyResp,
  LeadTimeForChangesResp,
  VelocityResp,
} from '@src/models/response/reportResp'
import { velocityMapper } from '@src/mapper/VelocityMapper'
import { cycleTimeMapper } from '@src/mapper/CycleTimeMapper'
import { classificationMapper } from '@src/mapper/ClassificationMapper'
import { deploymentFrequencyMapper } from '@src/mapper/DeploymentFrequencyMapper'
import { leadTimeForChangesMapper } from '@src/mapper/LeadTimeForChangesMapper'
import { changeFailureRateMapper } from '@src/mapper/ChangeFailureRateMapper'

export const reportResponseMapper = (response: {
  velocity: VelocityResp
  cycleTime: CycleTimeResp
  classification: Array<ClassificationResp>
  deploymentFrequency: DeploymentFrequencyResp
  leadTimeForChanges: LeadTimeForChangesResp
  changeFailureRate: ChangeFailureRateResp
}) => {
  const { velocity, cycleTime, classification, deploymentFrequency, leadTimeForChanges, changeFailureRate } = response

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
