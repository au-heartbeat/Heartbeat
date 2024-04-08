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
import { TDateRange } from '@src/context/config/configSlice';
import { formatDate } from '@src/utils/util';
import { theme } from '@src/theme';

type Props = {
  dateRanges: TDateRange;
  expandColor?: string;
  expandBackgroundColor?: string;
};

const DateRangeViewer = ({
  dateRanges,
  expandColor = theme.palette.text.disabled,
  expandBackgroundColor = theme.palette.secondary.dark,
}: Props) => {
  const [showMoreDateRange, setShowMoreDateRange] = useState(false);
  const datePick = dateRanges[0];
  const DateRangeExpandRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (DateRangeExpandRef.current && !DateRangeExpandRef.current?.contains(event.target as Node)) {
      setShowMoreDateRange(false);
    }
  }, []);

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
          return (
            <SingleDateRange key={index} color={expandColor} backgroundColor={expandBackgroundColor}>
              {formatDate(dateRange.startDate ?? '')}
              <StyledArrowForward />
              {formatDate(dateRange.endDate ?? '')}
            </SingleDateRange>
          );
        })}
      </DateRangeExpandContainer>
    );
  });

  return (
    <DateRangeContainer data-test-id={'date-range'}>
      {formatDate(datePick.startDate ?? '')}
      <StyledArrowForward />
      {formatDate(datePick.endDate ?? '')}
      <StyledCalendarToday />
      <StyledDivider orientation='vertical' />
      <StyledExpandMoreIcon onClick={() => setShowMoreDateRange(true)} />
      {showMoreDateRange && <DateRangeExpand ref={DateRangeExpandRef} />}
    </DateRangeContainer>
  );
};

export default DateRangeViewer;
