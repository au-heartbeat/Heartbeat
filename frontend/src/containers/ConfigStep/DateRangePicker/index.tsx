import { DateRangePickerGroup, SortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { ISortedDateRangeType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { selectDateRange, selectDateRangeSortStatus } from '@src/context/config/configSlice';
import { SortDateRange } from '@src/containers/ConfigStep/DateRangePicker/SortDateRange';
import SectionTitleWithTooltip from '@src/components/Common/SectionTitleWithTooltip';
import { TitleContainer } from '@src/containers/ConfigStep/DateRangePicker/style';
import { TIME_RANGE_TITLE, TIPS } from '@src/constants/resources';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { useMemo, useState } from 'react';

export const DateRangePickerSection = () => {
  const dateRangeGroup = useAppSelector(selectDateRange);
  const dateRangeGroupSortStatus = useAppSelector(selectDateRangeSortStatus);
  const [sortType, setSortType] = useState<SortType>(
    dateRangeGroupSortStatus ? dateRangeGroupSortStatus : SortType.DEFAULT,
  );

  const [hasError, setHasError] = useState(false);
  const isDateRangeValid = useMemo(() => {
    return dateRangeGroup.every((dateRange) => {
      return (
        dateRange.startDate !== null &&
        dateRange.endDate !== null &&
        dateRange.startDate !== 'Invalid Date' &&
        dateRange.endDate !== 'Invalid Date'
      );
    });
  }, [dateRangeGroup]);

  const handleSortStatusChange = (type: SortType) => {
    setSortType(type);
  };

  const handleError = (err: ISortedDateRangeType[]) => {
    setHasError(!!err.length);
  };

  return (
    <div aria-label='Time range section'>
      <TitleContainer>
        <SectionTitleWithTooltip
          title={TIME_RANGE_TITLE}
          tooltipText={TIPS.TIME_RANGE_PICKER}
          titleStyle={{
            margin: '1rem 0',
          }}
        />
        {dateRangeGroup.length > 1 && isDateRangeValid && !hasError && (
          <SortDateRange onChange={handleSortStatusChange} sortType={sortType} />
        )}
      </TitleContainer>
      <DateRangePickerGroup sortType={sortType} onError={handleError} />
    </div>
  );
};
