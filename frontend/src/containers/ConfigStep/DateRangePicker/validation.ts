import { BasicConfigState } from '@src/context/config/configSlice';
import dayjs, { Dayjs } from 'dayjs';

type IDateRange = Dayjs[];

export const calculateDateRangeIntersection = (dateRangeGroup: BasicConfigState['basic']['dateRange']) => {
  let result = [dayjs(null), dayjs(null)];

  try {
    let earliest = dayjs(dateRangeGroup[0].startDate);
    let latest = dayjs(dateRangeGroup[0].startDate);

    for (let { startDate, endDate } of dateRangeGroup) {
      const startDayjsObj = dayjs(startDate);
      const endDayjsObj = dayjs(endDate);
      if (startDayjsObj.isBefore(earliest)) {
        earliest = startDayjsObj;
      }
      if (endDayjsObj.isAfter(latest)) {
        latest = endDayjsObj;
      }
    }

    result = [earliest, latest];
  } catch (e) {
    console.error('[calculateDateRangeIntersection] error', e);
  }

  return result;
};

export const calculateDateIsAvailable = ([earliest, latest]: IDateRange, date: dayjs.Dayjs) =>
  date.isBefore(earliest) || date.isAfter(latest);
