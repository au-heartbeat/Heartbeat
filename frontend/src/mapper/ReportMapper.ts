import { CycleTime, VelocityRes } from '@src/models/response/reportRes'
import { velocityMapper } from '@src/mapper/VelocityMapper'
import { cycleTimeMapper } from '@src/mapper/CycleTimeMapper'

export const reportResponseMapper = (response: { velocity: VelocityRes; cycleTime: CycleTime }) => {
  const {
    velocity: { velocityForSP, velocityForCards },
    cycleTime: { averageCycleTimePerCard, averageCycleTimePerSP, totalTimeForCards, swimlaneList },
  } = response
  const velocityValues = velocityMapper(velocityForSP, velocityForCards)
  const cycleValues = cycleTimeMapper(swimlaneList, totalTimeForCards, averageCycleTimePerSP, averageCycleTimePerCard)

  return { velocityValues, cycleValues }
}
