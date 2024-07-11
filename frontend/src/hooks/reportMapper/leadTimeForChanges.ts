import { LeadTimeForChangesResponse } from '@src/clients/report/dto/response';
import { IPipelineConfig } from '@src/context/Metrics/metricsSlice';

export const leadTimeForChangesMapper = (
  { leadTimeForChangesOfPipelines, avgLeadTimeForChanges }: LeadTimeForChangesResponse,
  selectedPipelines: IPipelineConfig[] | null,
) => {
  const nonDataPipelinesName = selectedPipelines
    ?.map((item) => `${item.pipelineName}/${item.step}`)
    .filter((it) => leadTimeForChangesOfPipelines.every((item) => `${item.name}/${item.step}` !== it));

  const minutesPerHour = 60;
  const formatDuration = (duration: number) => {
    return (duration / minutesPerHour).toFixed(2);
  };
  const formatNameDisplay = (name: string) => {
    if (name == 'pipelineLeadTime') return 'Pipeline Lead Time';
    if (name == 'prLeadTime') return 'PR Lead Time';
    if (name == 'totalDelayTime') return 'Total Lead Time';
  };

  const mappedLeadTimeForChangesValue = leadTimeForChangesOfPipelines.map((item, index) => {
    return {
      id: index,
      name: `${item.name}/${item.step}`,
      valueList: Object.entries(item)
        .slice(-3)
        .map(([name, value]) => ({
          name: formatNameDisplay(name) as string,
          value: formatDuration(value),
        })),
    };
  });

  nonDataPipelinesName?.forEach((it, index) => {
    mappedLeadTimeForChangesValue.push({
      id: mappedLeadTimeForChangesValue.length + index,
      name: it,
      valueList: [
        {
          name: 'Pipeline Lead Time',
          value: '0.00',
        },
        {
          name: 'PR Lead Time',
          value: '0.00',
        },
        {
          name: 'Total Lead Time',
          value: '0.00',
        },
      ],
    });
  });

  mappedLeadTimeForChangesValue.push({
    id: mappedLeadTimeForChangesValue.length,
    name: avgLeadTimeForChanges.name,
    valueList: Object.entries(avgLeadTimeForChanges)
      .slice(-3)
      .map(([name, value]) => ({
        name: formatNameDisplay(name) as string,
        value: formatDuration(value),
      })),
  });

  return mappedLeadTimeForChangesValue;
};
