import {
  AscendingIcon,
  DescendingIcon,
  SortButton,
  SortButtonContainer,
  SortTextButton,
} from '@src/containers/ConfigStep/DateRangePicker/style';
import { ISortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { updateDateRangeSortType } from '@src/context/config/configSlice';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { SORT_DATE_RANGE_TEXT } from '@src/constants/resources';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { Box } from '@mui/material';
import { useState } from 'react';

type IProps = {
  onChange: (type: ISortType) => void;
  sortType: ISortType;
};

export const SortDateRange = ({ onChange, sortType }: IProps) => {
  const dispatch = useAppDispatch();
  const [dateRangeSortType, setDateRangeSortType] = useState(sortType);

  const handleChangeSort = () => {
    const totalSortTypes = Object.values(ISortType).length;
    const currentIndex = Object.values(ISortType).indexOf(dateRangeSortType);
    const newIndex = (currentIndex + 1) % totalSortTypes;
    const newSortType = Object.values(ISortType)[newIndex];

    setDateRangeSortType(newSortType);
    dispatch(updateDateRangeSortType(newSortType));
    onChange?.(newSortType);
  };

  return (
    <Box aria-label='Sorting date range'>
      <SortButtonContainer>
        <SortTextButton disableRipple>{SORT_DATE_RANGE_TEXT[dateRangeSortType]}</SortTextButton>
        <SortButton aria-label='sort button' onClick={handleChangeSort}>
          {dateRangeSortType === ISortType.ASCENDING ? (
            <AscendingIcon fontSize='inherit' />
          ) : (
            <ArrowDropUp fontSize='inherit' />
          )}
          {dateRangeSortType === ISortType.DESCENDING ? (
            <DescendingIcon fontSize='inherit' />
          ) : (
            <ArrowDropDown fontSize='inherit' />
          )}
        </SortButton>
      </SortButtonContainer>
    </Box>
  );
};
