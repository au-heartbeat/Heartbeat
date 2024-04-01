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

export const calculateLastAvailableDate = (date: Dayjs, coveredRange: BasicConfigState['basic']['dateRange']) => {
  let lastAvailableDate = dayjs(new Date()).startOf('date');
  let minimumDiffDays = lastAvailableDate.diff(date, 'days');

  for (const { startDate } of coveredRange) {
    const startDateDayjsObj = dayjs(startDate);
    if (startDateDayjsObj.isValid()) {
      const diffDays = startDateDayjsObj.diff(date, 'days');
      if (startDateDayjsObj.isSameOrAfter(date) && diffDays <= minimumDiffDays) {
        lastAvailableDate = startDateDayjsObj.subtract(1, 'day');
        minimumDiffDays = diffDays;
      }
    }
  }

  return lastAvailableDate;
};

export const calculateStartDateShouldDisable = (
  selfEndDate: Dayjs,
  coveredRange: BasicConfigState['basic']['dateRange'],
  date: Dayjs,
) => {
  const isDateInCovredRange = coveredRange.some(
    ({ startDate, endDate }) => date.isSameOrAfter(startDate, 'date') && date.isSameOrBefore(endDate, 'date'),
  );
  return isDateInCovredRange || date.isAfter(selfEndDate);
};

export const calculateEndDateShouldDisable = (
  selfStartDate: Dayjs,
  coveredRange: BasicConfigState['basic']['dateRange'],
  date: Dayjs,
) => {
  const isDateInCovredRange = coveredRange.some(
    ({ startDate, endDate }) => date.isSameOrAfter(startDate, 'date') && date.isSameOrBefore(endDate, 'date'),
  );
  return isDateInCovredRange || date.isBefore(selfStartDate);
};
