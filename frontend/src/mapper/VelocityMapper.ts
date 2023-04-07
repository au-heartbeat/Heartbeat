import { VelocityMetric } from '@src/constants'

export const velocityMapper = (velocityForSP: string, velocityForCards: string) => {
  const velocityValues = {
    [VelocityMetric.VELOCITY_SP]: velocityForSP,
    [VelocityMetric.THROUGHPUT_CARDS_COUNT]: velocityForCards,
  }

  return velocityValues
}
