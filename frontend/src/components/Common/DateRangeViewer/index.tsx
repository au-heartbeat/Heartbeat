import {
  DateRangeContainer,
  DateRangeExpandContainer,
  SingleDateRange,
  StyledArrowForward,
  StyledCalendarToday,
  StyledDivider,
  StyledExpandMoreIcon,
} from './style';
import React, { useRef, useState, forwardRef, useEffect, useCallback } from 'react';
import { DateRange } from '@src/context/config/configSlice';
import { formatDate } from '@src/utils/util';

type Props = {
  dateRanges: DateRange;
  selectedDateRange?: Record<string, string | null | boolean | undefined>;
  changeDateRange?: (dateRange: Record<string, string | null | boolean | undefined>) => void;
  expandColor?: string;
  expandBackgroundColor?: string;
  disabledAll: boolean;
};

const DateRangeViewer = ({ dateRanges, changeDateRange, selectedDateRange, disabledAll = true }: Props) => {
  const [showMoreDateRange, setShowMoreDateRange] = useState(false);
  const DateRangeExpandRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (DateRangeExpandRef.current && !DateRangeExpandRef.current?.contains(event.target as Node)) {
      setShowMoreDateRange(false);
    }
  }, []);

  const handleClick = (index: number) => {
    changeDateRange && changeDateRange(dateRanges[index]);
    setShowMoreDateRange(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const DateRangeExpand = forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <DateRangeExpandContainer ref={ref}>
        {dateRanges.map((dateRange, index) => {
          const disabled = dateRange.disabled || disabledAll;
          return (
            <SingleDateRange disabled={disabled} onClick={() => handleClick(index)} key={index}>
              {formatDate(dateRange.startDate as string)}
              <StyledArrowForward />
              {formatDate(dateRange.endDate as string)}
            </SingleDateRange>
          );
        })}
      </DateRangeExpandContainer>
    );
  });

  return (
    <DateRangeContainer data-test-id={'date-range'} aria-disabled={disabledAll}>
      {formatDate((selectedDateRange || dateRanges[0]).startDate as string)}
      <StyledArrowForward />
      {formatDate((selectedDateRange || dateRanges[0]).endDate as string)}
      <StyledCalendarToday />
      <StyledDivider orientation='vertical' />
      <StyledExpandMoreIcon aria-label='expandMore' onClick={() => setShowMoreDateRange(true)} />
      {showMoreDateRange && <DateRangeExpand ref={DateRangeExpandRef} />}
    </DateRangeContainer>
  );
};

export default DateRangeViewer;
