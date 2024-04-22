import {
  AscendingIcon,
  DescendingIcon,
  SortingButton,
  SortingButtoningContainer,
  SortingTextButton,
} from '@src/containers/ConfigStep/DateRangePicker/style';
import { SortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { updateDateRangeSortType } from '@src/context/config/configSlice';
import { SORTING_DATE_RANGE_TEXT } from '@src/constants/resources';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { Box } from '@mui/material';
import { useState } from 'react';

type Props = {
  onChange: (type: SortType) => void;
  sortType: SortType;
  disabled: boolean;
};

export const SortingDateRange = ({ onChange, sortType, disabled }: Props) => {
  const dispatch = useAppDispatch();
  const [dateRangeSortType, setDateRangeSortType] = useState(sortType);

  const handleChangeSort = () => {
    const totalSortTypes = Object.values(SortType).length;
    const currentIndex = Object.values(SortType).indexOf(dateRangeSortType);
    const newIndex = (currentIndex + 1) % totalSortTypes;
    const newSortType = Object.values(SortType)[newIndex];

    setDateRangeSortType(newSortType);
    dispatch(updateDateRangeSortType(newSortType));
    onChange?.(newSortType);
  };

  return (
    <Box aria-label='Sorting date range'>
      <SortingButtoningContainer>
        <SortingTextButton disableRipple>{SORTING_DATE_RANGE_TEXT[dateRangeSortType]}</SortingTextButton>
        <SortingButton aria-label='sort button' onClick={handleChangeSort} disabled={disabled}>
          {dateRangeSortType === SortType.ASCENDING ? (
            <AscendingIcon disabled={disabled} />
          ) : (
            <ArrowDropUp fontSize='inherit' />
          )}
          {dateRangeSortType === SortType.DESCENDING ? (
            <DescendingIcon disabled={disabled} />
          ) : (
            <ArrowDropDown fontSize='inherit' />
          )}
        </SortingButton>
      </SortingButtoningContainer>
    </Box>
  );
};
