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
import { useState } from 'react';

export const SortDateRange = () => {
  const dateRangeGroup = useAppSelector(selectDateRange);
  console.log('dateRangeGroup', dateRangeGroup);
  const [sortOrder, setSortOrder] = useState('DEFAULT');

  function handleChangeSort() {
    const sortStates: Record<string, string> = {
      DEFAULT: 'DESCENDING',
      DESCENDING: 'ASCENDING',
      ASCENDING: 'DEFAULT',
    };
    setSortOrder(sortStates[sortOrder]);
  }
  return (
    <div aria-label='Time range sort'>
      <SortButtonContainer>
        <SortTextButton disableRipple>{SORT_DATE_RANGE_TEXT[sortOrder]}</SortTextButton>
        <SortButton onClick={handleChangeSort}>
          {sortOrder === 'ASCENDING' ? <AscendingIcon fontSize='inherit' /> : <ArrowDropUp fontSize='inherit' />}
          {sortOrder === 'DESCENDING' ? <DescendingIcon fontSize='inherit' /> : <ArrowDropDown fontSize='inherit' />}
        </SortButton>
      </SortButtonContainer>
    </div>
  );
};
