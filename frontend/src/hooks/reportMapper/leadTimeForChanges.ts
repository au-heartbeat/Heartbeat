import { ReportDataForMultipleValueColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { LeadTimeForChangesResponse } from '@src/clients/report/dto/response';

export const leadTimeForChangesMapper = ({
  leadTimeForChangesOfPipelines,
  avgLeadTimeForChanges,
  leadTimeForChangesOfSourceControls,
}: LeadTimeForChangesResponse) => {
  const minutesPerHour = 60;
  const formatDuration = (duration: number) => {
    return (duration / minutesPerHour).toFixed(2);
  };
  const formatNameDisplay = (name: string) => {
    if (name == 'pipelineLeadTime') return 'Pipeline Lead Time';
    if (name == 'prLeadTime') return 'PR Lead Time';
    if (name == 'totalDelayTime') return 'Total Lead Time';
  };

  const mappedLeadTimeForChangesValue: ReportDataForMultipleValueColumns[] = leadTimeForChangesOfPipelines.map(
    (item, index) => {
      return {
        id: index,
        name: `${item.name}/${item.step}`,
        valueList: Object.entries(item)
          .slice(-3)
          .map(([name, value]) => ({
            name: formatNameDisplay(name) as string,
            values: [formatDuration(value)],
          })),
      };
    },
  );

  mappedLeadTimeForChangesValue.push(
    ...leadTimeForChangesOfSourceControls.map((item, index) => {
      return {
        id: index + mappedLeadTimeForChangesValue.length,
        name: `${item.organization}/${item.repo}`,
        valueList: Object.entries(item)
          .slice(-3)
          .map(([name, value]) => ({
            name: formatNameDisplay(name) as string,
            values: [formatDuration(value)],
          })),
      };
    }),
  );

  mappedLeadTimeForChangesValue.push({
    id: mappedLeadTimeForChangesValue.length,
    name: avgLeadTimeForChanges.name,
    valueList: Object.entries(avgLeadTimeForChanges)
      .slice(-3)
      .map(([name, value]) => ({
        name: formatNameDisplay(name) as string,
        values: [formatDuration(value)],
      })),
  });

  return mappedLeadTimeForChangesValue;
};
