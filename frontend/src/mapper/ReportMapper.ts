import { CycleTimeRes, VelocityRes } from '@src/models/response/reportRes'
import { velocityMapper } from '@src/mapper/VelocityMapper'
import { cycleTimeMapper } from '@src/mapper/CycleTimeMapper'

export const reportResponseMapper = (response: { velocity: VelocityRes; cycleTime: CycleTimeRes }) => {
  const { velocity, cycleTime } = response
  const velocityValues = velocityMapper(velocity)

  const cycleValues = cycleTimeMapper(cycleTime)

  return { velocityValues, cycleValues }
}
