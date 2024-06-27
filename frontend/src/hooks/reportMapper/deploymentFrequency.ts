import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { DeploymentFrequencyResponse } from '@src/clients/report/dto/response';

export const deploymentFrequencyMapper = ({
  deploymentFrequencyOfPipelines,
  avgDeploymentFrequency,
  totalDeployTimes,
}: DeploymentFrequencyResponse) => {
  const mappedDeploymentFrequencyValue: ReportDataWithTwoColumns[] = [];

  deploymentFrequencyOfPipelines.map((item, index) => {
    const deploymentFrequencyValue: ReportDataWithTwoColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      valueList: [{ value: `${item.deploymentFrequency.toFixed(2)}` }, { value: `${item.deployTimes}` }],
    };
    mappedDeploymentFrequencyValue.push(deploymentFrequencyValue);
  });

  mappedDeploymentFrequencyValue.push({
    id: mappedDeploymentFrequencyValue.length,
    name: avgDeploymentFrequency.name,
    valueList: [
      {
        value: `${avgDeploymentFrequency.deploymentFrequency.toFixed(2)}`,
      },
      {
        value: `${(totalDeployTimes / deploymentFrequencyOfPipelines.length).toFixed(2)}`,
      },
    ],
  });

  return mappedDeploymentFrequencyValue;
};
