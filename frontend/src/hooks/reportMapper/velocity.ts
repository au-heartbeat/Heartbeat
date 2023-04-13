import { VELOCITY_METRICS_NAME } from '@src/constants'
import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure'
import { VelocityResp } from '@src/clients/report/dto/responseDTO'

export const velocityMapper = ({ velocityForSP, velocityForCards }: VelocityResp) => {
  const mappedVelocityValue: ReportDataWithTwoColumns[] = []

  const velocityValue: { [key: string]: string } = {
    VELOCITY_SP: velocityForSP,
    THROUGHPUT_CARDS_COUNT: velocityForCards,
  }

  Object.entries(VELOCITY_METRICS_NAME).map(([key, velocityName], index) => {
    mappedVelocityValue.push({
      id: index,
      name: velocityName,
      value: [velocityValue[key]],
    })
  })

  return mappedVelocityValue
}
