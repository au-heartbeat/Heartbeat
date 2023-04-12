import { CycleTimeResp, VelocityResp } from '@src/models/response/reportResp'
import { velocityMapper } from '@src/mapper/VelocityMapper'
import { cycleTimeMapper } from '@src/mapper/CycleTimeMapper'

export const reportResponseMapper = (response: { velocity: VelocityResp; cycleTime: CycleTimeResp }) => {
  const { velocity, cycleTime } = response

  const velocityValues = velocityMapper(velocity)

  const cycleValues = cycleTimeMapper(cycleTime)

  return { velocityValues, cycleValues }
}
