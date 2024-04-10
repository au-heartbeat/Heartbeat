import { DateRangePickerGroup, SortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { SortDateRange } from '@src/containers/ConfigStep/DateRangePicker/SortDateRange';
import SectionTitleWithTooltip from '@src/components/Common/SectionTitleWithTooltip';
import { TitleContainer } from '@src/containers/ConfigStep/DateRangePicker/style';
import { selectDateRange } from '@src/context/config/configSlice';
import { TIME_RANGE_TITLE, TIPS } from '@src/constants/resources';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { useMemo, useState } from 'react';

export const DateRangePickerSection = () => {
  const dateRangeGroup = useAppSelector(selectDateRange);
  const [sortStatus, setSortStatus] = useState<SortType>(SortType.DEFAULT);
  const isDateRangeValid = useMemo(() => {
    return dateRangeGroup.every((dateRange) => {
      return (
        dateRange.startDate !== null &&
        dateRange.endDate !== null &&
        dateRange.startDate !== 'Invalid Date' &&
        dateRange.endDate !== 'Invalid Date'
        // !isNaN(Date.parse(dateRange.startDate as string)) && !isNaN(Date.parse(dateRange.endDate as string))
      );
    });
  }, [dateRangeGroup]);

  const handleChange = (type: SortType) => {
    setSortStatus(type);
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
        {dateRangeGroup.length > 1 && isDateRangeValid && <SortDateRange onChange={handleChange} />}
      </TitleContainer>
      <DateRangePickerGroup sortStatus={sortStatus} />
    </div>
  );
};
