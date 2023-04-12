import { VelocityMetricsName } from '@src/constants'
import { ReportMetrics } from '@src/models/reportUiState'
import { VelocityResp } from '@src/models/response/reportResp'

export const velocityMapper = ({ velocityForSP, velocityForCards }: VelocityResp) => {
  const velocityMetrics: ReportMetrics[] = []

  const velocityValue: { [key: string]: string } = {
    VELOCITY_SP: velocityForSP,
    THROUGHPUT_CARDS_COUNT: velocityForCards,
  }

  Object.entries(VelocityMetricsName).map(([key, velocityName]) => {
    velocityMetrics.push({
      id: velocityMetrics.length + 1,
      name: velocityName,
      value: velocityValue[key],
    })
  })

  return velocityMetrics
}
