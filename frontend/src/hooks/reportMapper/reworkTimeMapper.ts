import { HAVE_UNIT_REWORK_TIMES, REWORK_TIME_METRICS_NAME } from '@src/constants/resources';
import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { ReworkTimeResponse } from '@src/clients/report/dto/response';

const getUnit = (value: string) => {
  if (HAVE_UNIT_REWORK_TIMES.includes(value)) return ' (times)';
  if (value === REWORK_TIME_METRICS_NAME.reworkCardsRatio) return ' (rework card/throughput)';
};

const reworkTimeMapper = (reworkTimeResponse: ReworkTimeResponse) => {
  const result: ReportDataWithTwoColumns[] = [];
  Object.entries(REWORK_TIME_METRICS_NAME).map(([key, value], index) => {
    result.push({
      id: index,
      name: value,
      valueList: [
        {
          value: reworkTimeResponse[key as keyof ReworkTimeResponse] || 0,
          unit: getUnit(value),
        },
      ],
    });
  });
  return result;
};
export default reworkTimeMapper;
