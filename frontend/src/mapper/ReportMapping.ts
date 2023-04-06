import { CycleTime, VelocityRes } from '@src/models/response/reportRes'
import { CycleTimeMetrics, VelocityMetric } from '@src/constants'

export const reportResponseMapper = (response: { velocity: VelocityRes; cycleTime: CycleTime }) => {
  const {
    velocity: { velocityForSP, velocityForCards },
    cycleTime: { averageCircleTimePerCard, averageCycleTimePerSP, totalTimeForCards },
  } = response

  const velocityValues = {
    [VelocityMetric.VELOCITY_SP]: velocityForSP,
    [VelocityMetric.THROUGHPUT_CARDS_COUNT]: velocityForCards,
  }

  const cycleValues = {
    [CycleTimeMetrics.AVERAGE_CIRCLE_TIME_PER_CARD]: averageCircleTimePerCard,
    [CycleTimeMetrics.AVERAGE_CYCLE_TIME_PER_SP]: averageCycleTimePerSP,
    [CycleTimeMetrics.TOTAL_TIME_FOR_CARDS]: totalTimeForCards,
  }
  return { velocityValues, cycleValues }
}
