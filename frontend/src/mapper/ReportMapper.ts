import {
  ClassificationResp,
  CycleTimeResp,
  DeploymentFrequencyResp,
  VelocityResp,
} from '@src/models/response/reportResp'
import { velocityMapper } from '@src/mapper/VelocityMapper'
import { cycleTimeMapper } from '@src/mapper/CycleTimeMapper'
import { classificationMapper } from '@src/mapper/ClassificationMapper'
import { deploymentFrequencyMapper } from '@src/mapper/DeploymentFrequencyMapper'

export const reportResponseMapper = (response: {
  velocity: VelocityResp
  cycleTime: CycleTimeResp
  classification: Array<ClassificationResp>
  deploymentFrequency: DeploymentFrequencyResp
}) => {
  const { velocity, cycleTime, classification, deploymentFrequency } = response

  const velocityValues = velocityMapper(velocity)

  const cycleValues = cycleTimeMapper(cycleTime)

  const classificationValues = classificationMapper(classification)

  const deploymentFrequencyValues = deploymentFrequencyMapper(deploymentFrequency)

  return { velocityValues, cycleValues, classificationValues, deploymentFrequencyValues }
}
