import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { PipelineChangeFailureRateResponse } from '@src/clients/report/dto/response';

export const pipelineChangeFailureRateMapper = ({
  pipelineChangeFailureRateOfPipelines,
  avgPipelineChangeFailureRate,
}: PipelineChangeFailureRateResponse) => {
  const mappedDevChangeFailureRateValue: ReportDataWithTwoColumns[] = [];

  pipelineChangeFailureRateOfPipelines.map((item, index) => {
    const devChangeFailureRateValue: ReportDataWithTwoColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      valueList: [
        {
          value: `${(item.failureRate * 100).toFixed(2)}%(${item.failedTimesOfPipeline}/${item.totalTimesOfPipeline})`,
        },
      ],
    };
    mappedDevChangeFailureRateValue.push(devChangeFailureRateValue);
  });

  mappedDevChangeFailureRateValue.push({
    id: mappedDevChangeFailureRateValue.length,
    name: avgPipelineChangeFailureRate.name,
    valueList: [
      {
        value: `${(avgPipelineChangeFailureRate.failureRate * 100).toFixed(2)}`,
      },
    ],
  });

  return mappedDevChangeFailureRateValue;
};
