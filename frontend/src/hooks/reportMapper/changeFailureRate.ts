import { ReportDataWithThreeColumns } from '@src/hooks/reportMapper/reportUIDataStructure'
import { ChangeFailureRateResp } from '@src/clients/report/dto/responseDTO'

export const changeFailureRateMapper = ({
  avgChangeFailureRate,
  changeFailureRateOfPipelines,
}: ChangeFailureRateResp) => {
  const mappedChangeFailureRateValue: ReportDataWithThreeColumns[] = []

  changeFailureRateOfPipelines.map((item, index) => {
    const deploymentFrequencyValue: ReportDataWithThreeColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      values: [{ name: 'Failure Rate', value: item.failureRate }],
    }
    mappedChangeFailureRateValue.push(deploymentFrequencyValue)
  })
  mappedChangeFailureRateValue.push({
    id: mappedChangeFailureRateValue.length,
    name: `${avgChangeFailureRate.name}/`,
    values: [{ name: 'Failure Rate', value: avgChangeFailureRate.failureRate }],
  })

  return mappedChangeFailureRateValue
}
