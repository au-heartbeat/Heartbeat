import {
  AscendingIcon,
  DescendingIcon,
  SortButton,
  SortButtonContainer,
  SortTextButton,
} from '@src/containers/ConfigStep/DateRangePicker/style';
import { selectDateRange } from '@src/context/config/configSlice';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { SORT_DATE_RANGE_TEXT } from '@src/constants/resources';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { Box } from '@mui/material';
import { useState } from 'react';

type IProps = {
  onChange: (type: string) => void;
};

const sortStates: Record<string, string> = {
  DEFAULT: 'DESCENDING',
  DESCENDING: 'ASCENDING',
  ASCENDING: 'DEFAULT',
};

export const SortDateRange = ({ onChange }: IProps) => {
  const dateRangeGroup = useAppSelector(selectDateRange);
  console.log('dateRangeGroup', dateRangeGroup);
  const [sortOrder, setSortOrder] = useState('DEFAULT');

  const handleChangeSort = () => {
    setSortOrder(sortStates[sortOrder]);
    onChange?.(sortStates[sortOrder]);
  };

  return (
    <Box aria-label='Time range sort'>
      <SortButtonContainer>
        <SortTextButton disableRipple>{SORT_DATE_RANGE_TEXT[sortOrder]}</SortTextButton>
        <SortButton onClick={handleChangeSort}>
          {sortOrder === 'ASCENDING' ? <AscendingIcon fontSize='inherit' /> : <ArrowDropUp fontSize='inherit' />}
          {sortOrder === 'DESCENDING' ? <DescendingIcon fontSize='inherit' /> : <ArrowDropDown fontSize='inherit' />}
        </SortButton>
      </SortButtonContainer>
    </Box>
  );
};
