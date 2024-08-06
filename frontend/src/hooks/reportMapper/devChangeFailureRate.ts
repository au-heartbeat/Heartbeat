import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { PipelineChangeFailureRateResponse } from '@src/clients/report/dto/response';

export const pipelineChangeFailureRateMapper = ({
  pipelineChangeFailureRateOfPipelines,
  avgPipelineChangeFailureRate,
}: PipelineChangeFailureRateResponse) => {
  const mappedPipelineChangeFailureRateValue: ReportDataWithTwoColumns[] = [];

  pipelineChangeFailureRateOfPipelines.map((item, index) => {
    const pipelineChangeFailureRateValue: ReportDataWithTwoColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      valueList: [
        {
          value: `${(item.failureRate * 100).toFixed(2)}%(${item.failedTimesOfPipeline}/${item.totalTimesOfPipeline})`,
        },
      ],
    };
    mappedPipelineChangeFailureRateValue.push(pipelineChangeFailureRateValue);
  });

  mappedPipelineChangeFailureRateValue.push({
    id: mappedPipelineChangeFailureRateValue.length,
    name: avgPipelineChangeFailureRate.name,
    valueList: [
      {
        value: `${(avgPipelineChangeFailureRate.failureRate * 100).toFixed(2)}%`,
      },
    ],
  });

  return mappedPipelineChangeFailureRateValue;
};
