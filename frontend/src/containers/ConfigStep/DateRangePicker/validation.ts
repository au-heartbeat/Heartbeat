import { BasicConfigState } from '@src/context/config/configSlice';
import dayjsSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore';
import dayjsSameOrAfterPlugin from 'dayjs/plugin/isSameOrAfter';
import dayjs, { Dayjs } from 'dayjs';

dayjs.extend(dayjsSameOrBeforePlugin);
dayjs.extend(dayjsSameOrAfterPlugin);

// some SIGNIFICANT prerequisites :
// dayjs(undefined).isValid() true
// dayjs(null).isValid() false
// dayjs('').isValid() false
// if dayjsA or dayjsB either is invalid
// all comparisons e.g. dayjsA.isBefore(dayjsB) always return false

type TDateRange = Dayjs[];

export const calculateDateRangeIntersection = (dateRangeGroup: BasicConfigState['basic']['dateRange']) => {
  let earliest = dayjs(dateRangeGroup[0]?.startDate || null);
  let latest = dayjs(dateRangeGroup[0]?.endDate || null);
  let result = [earliest, latest];

  for (let { startDate, endDate } of dateRangeGroup) {
    const startDayjsObj = dayjs(startDate);
    const endDayjsObj = dayjs(endDate);
    if (!earliest.isValid()) {
      earliest = startDayjsObj;
    } else if (startDayjsObj.isBefore(earliest)) {
      earliest = startDayjsObj;
    }

    if (!latest.isValid()) {
      latest = endDayjsObj;
    } else if (endDayjsObj.isAfter(latest)) {
      latest = endDayjsObj;
    }
  }

  return [earliest, latest];
};

export const calculateStartDateShouldDisable = (
  selfEndDate: Dayjs,
  coveredRange: BasicConfigState['basic']['dateRange'],
  date: Dayjs,
) => {
  const [earliest, latest] = calculateDateRangeIntersection(coveredRange);
  let isDateInCovredRange: boolean;
  if (!earliest.isValid() || !latest.isValid()) {
    isDateInCovredRange = false;
  } else {
    isDateInCovredRange = date.isSameOrAfter(earliest, 'date') && date.isSameOrBefore(latest, 'date');
  }
  return isDateInCovredRange || date.isAfter(selfEndDate);
};

export const calculateEndDateShouldDisable = (
  selfStartDate: Dayjs,
  coveredRange: BasicConfigState['basic']['dateRange'],
  date: Dayjs,
) => {
  const [earliest, latest] = calculateDateRangeIntersection(coveredRange);
  let isDateInCovredRange: boolean;
  if (!earliest.isValid() || !latest.isValid()) {
    isDateInCovredRange = false;
  } else {
    isDateInCovredRange = date.isSameOrAfter(earliest, 'date') && date.isSameOrBefore(latest, 'date');
  }
  return isDateInCovredRange || date.isBefore(selfStartDate);
};
