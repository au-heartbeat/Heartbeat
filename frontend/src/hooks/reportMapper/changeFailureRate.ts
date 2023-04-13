import { ReportDataWithThreeColumns } from '@src/hooks/reportMapper/reportUIDataStructure'
import { ChangeFailureRateResp } from '@src/clients/report/dto/responseDTO'
import { FAILURE_RATE_NAME } from '@src/constants'

export const changeFailureRateMapper = ({
  avgChangeFailureRate,
  changeFailureRateOfPipelines,
}: ChangeFailureRateResp) => {
  const mappedChangeFailureRateValue: ReportDataWithThreeColumns[] = []

  changeFailureRateOfPipelines.map((item, index) => {
    const deploymentFrequencyValue: ReportDataWithThreeColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      values: [{ name: FAILURE_RATE_NAME, value: item.failureRate }],
    }
    mappedChangeFailureRateValue.push(deploymentFrequencyValue)
  })
  mappedChangeFailureRateValue.push({
    id: mappedChangeFailureRateValue.length,
    name: `${avgChangeFailureRate.name}/`,
    values: [{ name: FAILURE_RATE_NAME, value: avgChangeFailureRate.failureRate }],
  })

  return mappedChangeFailureRateValue
}
