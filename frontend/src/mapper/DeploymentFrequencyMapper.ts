import { ReportDataWithThreeColumns } from '@src/models/reportUIDataStructure'
import { DeploymentFrequencyResp } from '@src/models/response/reportResp'

export const deploymentFrequencyMapper = ({
  avgDeploymentFrequency,
  deploymentFrequencyOfPipelines,
}: DeploymentFrequencyResp) => {
  const mappedDeploymentFrequencyValue: ReportDataWithThreeColumns[] = []

  deploymentFrequencyOfPipelines.map((item, index) => {
    const deploymentFrequencyValue: ReportDataWithThreeColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      values: [{ name: 'Deployment Frequency(deployments/day)', value: item.deploymentFrequency }],
    }
    mappedDeploymentFrequencyValue.push(deploymentFrequencyValue)
  })
  mappedDeploymentFrequencyValue.push({
    id: mappedDeploymentFrequencyValue.length,
    name: `${avgDeploymentFrequency.name}/`,
    values: [{ name: 'Deployment Frequency(deployments/day)', value: avgDeploymentFrequency.deploymentFrequency }],
  })

  return mappedDeploymentFrequencyValue
}
