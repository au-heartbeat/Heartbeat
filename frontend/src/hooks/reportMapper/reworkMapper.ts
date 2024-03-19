import { ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { BOARD_COLUMN_STATE, REWORK_TIME_METRICS_NAME } from '@src/constants/resources';
import { ReworkTimeResponse } from '@src/clients/report/dto/response';

const getUnit = (value: string) => {
  if (
    [
      ...BOARD_COLUMN_STATE,
      REWORK_TIME_METRICS_NAME.totalReworkTimes,
      REWORK_TIME_METRICS_NAME.totalReworkCards,
    ].includes(value)
  )
    return ' (times)';
  if (value === REWORK_TIME_METRICS_NAME.reworkCardsRatio) return ' (rework card/throughput)';
};

const reworkMapper = (reworkTimeResponse: ReworkTimeResponse) => {
  const result: ReportDataWithTwoColumns[] = [];
  const reworkState = reworkTimeResponse.reworkState;

  Object.entries(REWORK_TIME_METRICS_NAME).map(([key, value], index) => {
    reworkTimeResponse[key as keyof ReworkTimeResponse] !== null &&
      result.push({
        id: index,
        name: `${BOARD_COLUMN_STATE.includes(value) ? `${value} ${reworkState}` : `${value}`} `,
        valueList: [
          {
            value: reworkTimeResponse[key as keyof ReworkTimeResponse]!,
            unit: getUnit(value),
          },
        ],
      });
  });
  return result;
};
export default reworkMapper;
