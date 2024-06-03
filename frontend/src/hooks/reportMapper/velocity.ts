import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { VelocityResponse } from '@src/clients/report/dto/response';
import { VelocityMetricsName } from '@src/constants/resources';

export const velocityMapper = ({ velocityForSP, velocityForCards }: VelocityResponse) => {
  const mappedVelocityValue: ReportDataWithTwoColumns[] = [];

  const velocityValue: { [key: string]: number } = {
    VelocitySP: velocityForSP,
    ThroughputCardsCount: velocityForCards,
  };

  Object.entries(VelocityMetricsName).map(([key, velocityName], index) => {
    mappedVelocityValue.push({
      id: index,
      name: velocityName,
      valueList: [{ value: velocityValue[key] }],
    });
  });

  return mappedVelocityValue;
};
