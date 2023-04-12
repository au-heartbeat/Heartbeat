import { VelocityMetricsName } from '@src/constants'
import { ReportDataWithTwoColumns } from '@src/models/reportUIDataStructure'
import { VelocityResp } from '@src/models/response/reportResp'

export const velocityMapper = ({ velocityForSP, velocityForCards }: VelocityResp) => {
  const mappedVelocityValue: ReportDataWithTwoColumns[] = []

  const velocityValue: { [key: string]: string } = {
    VELOCITY_SP: velocityForSP,
    THROUGHPUT_CARDS_COUNT: velocityForCards,
  }

  Object.entries(VelocityMetricsName).map(([key, velocityName], index) => {
    mappedVelocityValue.push({
      id: index,
      name: velocityName,
      value: [velocityValue[key]],
    })
  })

  return mappedVelocityValue
}
