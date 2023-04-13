import { ReportDataWithThreeColumns } from '@src/hooks/reportMapper/reportUIDataStructure'
import { DeploymentFrequencyResp } from '@src/clients/report/dto/responseDTO'
import { DEPLOYMENT_FREQUENCY_NAME } from '@src/constants'

export const deploymentFrequencyMapper = ({
  avgDeploymentFrequency,
  deploymentFrequencyOfPipelines,
}: DeploymentFrequencyResp) => {
  const mappedDeploymentFrequencyValue: ReportDataWithThreeColumns[] = []

  deploymentFrequencyOfPipelines.map((item, index) => {
    const deploymentFrequencyValue: ReportDataWithThreeColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      values: [{ name: DEPLOYMENT_FREQUENCY_NAME, value: item.deploymentFrequency }],
    }
    mappedDeploymentFrequencyValue.push(deploymentFrequencyValue)
  })
  mappedDeploymentFrequencyValue.push({
    id: mappedDeploymentFrequencyValue.length,
    name: `${avgDeploymentFrequency.name}/`,
    values: [{ name: DEPLOYMENT_FREQUENCY_NAME, value: avgDeploymentFrequency.deploymentFrequency }],
  })

  return mappedDeploymentFrequencyValue
}
