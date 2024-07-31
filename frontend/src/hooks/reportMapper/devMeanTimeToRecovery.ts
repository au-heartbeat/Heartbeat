import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { PipelineMeanTimeToRecoveryResponse } from '@src/clients/report/dto/response';

export const pipelineMeanTimeToRecoveryMapper = ({
  pipelineMeanTimeToRecoveryOfPipelines,
  avgPipelineMeanTimeToRecovery,
}: PipelineMeanTimeToRecoveryResponse) => {
  const minutesPerHour = 60;
  const millisecondMinute = 60000;
  const formatDuration = (duration: number) => {
    const minutesDuration = duration / millisecondMinute;
    return (minutesDuration / minutesPerHour).toFixed(2);
  };

  const mappedPipelineMeanTimeToRecoveryValue: ReportDataWithTwoColumns[] = [];

  pipelineMeanTimeToRecoveryOfPipelines.map((item, index) => {
    const pipelineMeanTimeToRecoveryValue: ReportDataWithTwoColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      valueList: [
        {
          value: formatDuration(item.timeToRecovery),
        },
      ],
    };
    mappedPipelineMeanTimeToRecoveryValue.push(pipelineMeanTimeToRecoveryValue);
  });

  mappedPipelineMeanTimeToRecoveryValue.push({
    id: mappedPipelineMeanTimeToRecoveryValue.length,
    name: avgPipelineMeanTimeToRecovery.name,
    valueList: [
      {
        value: `${formatDuration(avgPipelineMeanTimeToRecovery.timeToRecovery)}`,
      },
    ],
  });

  return mappedPipelineMeanTimeToRecoveryValue;
};
