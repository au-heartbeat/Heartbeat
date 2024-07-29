import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { PipelineMeanTimeToRecoveryResponse } from '@src/clients/report/dto/response';

export const pipelineMeanTimeToRecoveryMapper = ({
  pipelineMeanTimeToRecoveryOfPipelines,
  avgPipelineMeanTimeToRecovery,
}: PipelineMeanTimeToRecoveryResponse) => {
  const minutesPerHour = 60;
  const milliscondMinute = 60000;
  const formatDuration = (duration: number) => {
    const minutesDuration = duration / milliscondMinute;
    return (minutesDuration / minutesPerHour).toFixed(2);
  };

  const mappedDevMeanTimeToRecoveryValue: ReportDataWithTwoColumns[] = [];

  pipelineMeanTimeToRecoveryOfPipelines.map((item, index) => {
    const devMeanTimeToRecoveryValue: ReportDataWithTwoColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      valueList: [
        {
          value: formatDuration(item.timeToRecovery),
        },
      ],
    };
    mappedDevMeanTimeToRecoveryValue.push(devMeanTimeToRecoveryValue);
  });

  mappedDevMeanTimeToRecoveryValue.push({
    id: mappedDevMeanTimeToRecoveryValue.length,
    name: avgPipelineMeanTimeToRecovery.name,
    valueList: [
      {
        value: `${formatDuration(avgPipelineMeanTimeToRecovery.timeToRecovery)}`,
      },
    ],
  });

  return mappedDevMeanTimeToRecoveryValue;
};
