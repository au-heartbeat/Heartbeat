import { VelocityMetric } from '@src/constants'
import { VelocityRes } from '@src/models/response/reportRes'

export const velocityMapper = ({ velocityForSP, velocityForCards }: VelocityRes) => {
  return {
    [VelocityMetric.VELOCITY_SP]: velocityForSP,
    [VelocityMetric.THROUGHPUT_CARDS_COUNT]: velocityForCards,
  }
}
