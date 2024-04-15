import {
  AscendingIcon,
  DescendingIcon,
  SortButton,
  SortButtonContainer,
  SortTextButton,
} from '@src/containers/ConfigStep/DateRangePicker/style';
import { SortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { updateDateRangeSortStatus } from '@src/context/config/configSlice';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { SORT_DATE_RANGE_TEXT } from '@src/constants/resources';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { Box } from '@mui/material';
import { useState } from 'react';

type IProps = {
  onChange: (type: SortType) => void;
  sortStatus: SortType;
};

const sortStates: Record<string, string> = {
  DEFAULT: 'DESCENDING',
  DESCENDING: 'ASCENDING',
  ASCENDING: 'DEFAULT',
};

export const SortDateRange = ({ onChange, sortStatus }: IProps) => {
  const dispatch = useAppDispatch();
  const [sortOrder, setSortOrder] = useState(sortStatus);

  const handleChangeSort = () => {
    setSortOrder(sortStates[sortOrder] as SortType);
    dispatch(updateDateRangeSortStatus(sortStates[sortOrder]));
    onChange?.(sortStates[sortOrder] as SortType);
  };

  return (
    <Box aria-label='Time range sort'>
      <SortButtonContainer>
        <SortTextButton disableRipple>{SORT_DATE_RANGE_TEXT[sortOrder]}</SortTextButton>
        <SortButton aria-label='sort button' onClick={handleChangeSort}>
          {sortOrder === 'ASCENDING' ? <AscendingIcon fontSize='inherit' /> : <ArrowDropUp fontSize='inherit' />}
          {sortOrder === 'DESCENDING' ? <DescendingIcon fontSize='inherit' /> : <ArrowDropDown fontSize='inherit' />}
        </SortButton>
      </SortButtonContainer>
    </Box>
  );
};
