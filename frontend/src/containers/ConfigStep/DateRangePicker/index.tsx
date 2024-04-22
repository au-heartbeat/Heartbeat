import { DateRangePickerGroup, SortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { SortedDateRangeType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { SortingDateRange } from '@src/containers/ConfigStep/DateRangePicker/SortingDateRange';
import { selectDateRange, selectDateRangeSortType } from '@src/context/config/configSlice';
import SectionTitleWithTooltip from '@src/components/Common/SectionTitleWithTooltip';
import { BASIC_INFO_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { TitleContainer } from '@src/containers/ConfigStep/DateRangePicker/style';
import { TIME_RANGE_TITLE, TIPS } from '@src/constants/resources';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const DateRangePickerSection = () => {
  const dateRangeGroup = useAppSelector(selectDateRange);
  const dateRangeGroupSortType = useAppSelector(selectDateRangeSortType);
  const [sortType, setSortType] = useState<SortType>(
    dateRangeGroupSortType ? dateRangeGroupSortType : SortType.DEFAULT,
  );

  const [hasError, setHasError] = useState(false);
  const isDateRangeValid = useMemo(() => {
    return dateRangeGroup.every((dateRange) => {
      return dateRange.startDate && dateRange.endDate;
    });
  }, [dateRangeGroup]);

  const { setError, clearErrors, reset } = useFormContext();
  useEffect(() => {
    if (hasError) {
      setError('dateRange', { message: BASIC_INFO_ERROR_MESSAGE.dateRange.invalid });
    } else {
      clearErrors('dateRange');
      reset(undefined, { keepValues: true, keepErrors: true, keepDirty: true, keepTouched: true });
    }
  }, [hasError]);

  const handleSortTypeChange = (type: SortType) => {
    setSortType(type);
  };

  const handleError = (err: SortedDateRangeType[]) => {
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
          <SortingDateRange onChange={handleSortTypeChange} sortType={sortType} />
        )}
      </TitleContainer>
      <DateRangePickerGroup sortType={sortType} onError={handleError} />
    </div>
  );
};
