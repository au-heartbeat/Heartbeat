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
  sortType: SortType;
};

export const SortDateRange = ({ onChange, sortType }: IProps) => {
  const dispatch = useAppDispatch();
  const [sortOrder, setSortOrder] = useState(sortType);

  const handleChangeSort = () => {
    const totalSortTypes = Object.values(SortType).length;
    const currentIndex = Object.values(SortType).indexOf(sortOrder);
    const newIndex = (currentIndex + 1) % totalSortTypes;
    const newSortType = Object.values(SortType)[newIndex];

    setSortOrder(newSortType);
    dispatch(updateDateRangeSortStatus(newSortType));
    onChange?.(newSortType);
  };

  return (
    <Box aria-label='Time range sort'>
      <SortButtonContainer>
        <SortTextButton disableRipple>{SORT_DATE_RANGE_TEXT[sortOrder]}</SortTextButton>
        <SortButton aria-label='sort button' onClick={handleChangeSort}>
          {sortOrder === SortType.ASCENDING ? <AscendingIcon fontSize='inherit' /> : <ArrowDropUp fontSize='inherit' />}
          {sortOrder === SortType.DESCENDING ? (
            <DescendingIcon fontSize='inherit' />
          ) : (
            <ArrowDropDown fontSize='inherit' />
          )}
        </SortButton>
      </SortButtonContainer>
    </Box>
  );
};
