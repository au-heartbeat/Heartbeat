import {
  DateRangeContainer,
  DateRangeExpandContainer,
  SingleDateRange,
  StyledArrowForward,
  StyledCalendarToday,
  StyledDivider,
  DateRangeFailedIconContainer,
  StyledExpandMoreIcon,
} from './style';
import React, { useRef, useState, forwardRef, useEffect, useCallback } from 'react';
import { formatDate, formatDateToTimestampString } from '@src/utils/util';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { DateRange } from '@src/context/config/configSlice';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { theme } from '@src/theme';

type Props = {
  dateRangeList: DateRange;
  selectedDateRange?: Record<string, string | null | boolean | undefined>;
  changeDateRange?: (dateRange: Record<string, string | null | boolean | undefined>) => void;
  disabledAll?: boolean;
};

const DateRangeViewer = ({ dateRangeList, changeDateRange, selectedDateRange, disabledAll = true }: Props) => {
  const [showMoreDateRange, setShowMoreDateRange] = useState(false);
  const datePick = dateRanges[0];
  const DateRangeExpandRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (DateRangeExpandRef.current && !DateRangeExpandRef.current?.contains(event.target as Node)) {
      setShowMoreDateRange(false);
    }
  }, []);

  const handleClick = (key: string) => {
    changeDateRange && changeDateRange(dateRangeList.find((dateRange) => dateRange.startDate === key)!);
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
        {dateRangeList.map((dateRange) => {
          const disabled = dateRange.disabled || disabledAll;
          return (
            <SingleDateRange
              disabled={disabled}
              onClick={() => handleClick(dateRange.startDate!)}
              key={dateRange.startDate!}
            >
            <SingleDateRange key={index} color={expandColor} backgroundColor={expandBackgroundColor}>
              <DateRangeFailedIconContainer>
                {hasError && <PriorityHighIcon color='error' />}
              </DateRangeFailedIconContainer>
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
    <DateRangeContainer data-test-id={'date-range'}>
      {formatDate(datePick.startDate as string)}
      <StyledArrowForward />
      {formatDate(datePick.endDate as string)}
      <StyledCalendarToday />
      <StyledDivider orientation='vertical' />
      <StyledExpandMoreIcon aria-label='expandMore' onClick={() => setShowMoreDateRange(true)} />
      {showMoreDateRange && <DateRangeExpand ref={DateRangeExpandRef} />}
    </DateRangeContainer>
  );
};

export default DateRangeViewer;
