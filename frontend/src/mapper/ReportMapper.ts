import {
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

export const reportResponseMapper = (response: {
  velocity: VelocityResp
  cycleTime: CycleTimeResp
  classification: Array<ClassificationResp>
  deploymentFrequency: DeploymentFrequencyResp
  leadTimeForChanges: LeadTimeForChangesResp
}) => {
  const { velocity, cycleTime, classification, deploymentFrequency, leadTimeForChanges } = response

  const velocityValues = velocityMapper(velocity)

  const cycleValues = cycleTimeMapper(cycleTime)

  const classificationValues = classificationMapper(classification)

  const deploymentFrequencyValues = deploymentFrequencyMapper(deploymentFrequency)

  const leadTimeForChangesValues = leadTimeForChangesMapper(leadTimeForChanges)

  return { velocityValues, cycleValues, classificationValues, deploymentFrequencyValues, leadTimeForChangesValues }
}
