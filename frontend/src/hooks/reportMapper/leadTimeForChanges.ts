import { LeadTimeForChangesResp } from '@src/clients/report/dto/responseDTO'
import { ReportDataWithThreeColumns } from '@src/hooks/reportMapper/reportUIDataStructure'

export const leadTimeForChangesMapper = ({
  leadTimeForChangesOfPipelines,
  avgLeadTimeForChanges,
}: LeadTimeForChangesResp) => {
  const mappedLeadTimeForChangesValue: ReportDataWithThreeColumns[] = []

  leadTimeForChangesOfPipelines.map((item, index) => {
    const deploymentFrequencyValue: ReportDataWithThreeColumns = {
      id: index,
      name: `${item.name}/${item.step}`,
      values: Object.entries(item)
        .slice(-3)
        .map(([name, value]) => ({
          name: name,
          value: value.toString(),
        })),
    }
    mappedLeadTimeForChangesValue.push(deploymentFrequencyValue)
  })
  mappedLeadTimeForChangesValue.push({
    id: mappedLeadTimeForChangesValue.length,
    name: `${avgLeadTimeForChanges.name}/`,
    values: Object.entries(avgLeadTimeForChanges)
      .slice(-3)
      .map(([name, value]) => ({
        name: name,
        value: value.toString(),
      })),
  })

  return mappedLeadTimeForChangesValue
}
