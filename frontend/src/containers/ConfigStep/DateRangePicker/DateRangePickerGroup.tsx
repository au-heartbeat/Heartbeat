import {
  initDeploymentFrequencySettings,
  updateShouldGetBoardConfig,
  updateShouldGetPipelineConfig,
} from '@src/context/Metrics/metricsSlice';
import { DateRangePickerGroupContainer } from '@src/containers/ConfigStep/DateRangePicker/style';
import { DateRangePicker } from '@src/containers/ConfigStep/DateRangePicker/DateRangePicker';
import { ADD_TIME_RANGE_BUTTON_TEXT, MAX_TIME_RANGE_AMOUNT } from '@src/constants/resources';
import { selectDateRange, updateDateRange } from '@src/context/config/configSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { AddButton } from '@src/components/Common/AddButtonOneLine';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateValidationError } from '@mui/x-date-pickers';
import sortBy from 'lodash/sortBy';
import { useState } from 'react';
import get from 'lodash/get';
import dayjs from 'dayjs';

export enum SortType {
  DESCENDING = 'DESCENDING',
  ASCENDING = 'ASCENDING',
  DEFAULT = 'DEFAULT',
}

type SortDateRange = {
  startDate: string | null;
  endDate: string | null;
  sortIndex: number;
  error: DateValidationError | null;
};

const sortFn = {
  DEFAULT: ({ sortIndex }: SortDateRange) => sortIndex,
  DESCENDING: ({ startDate }: SortDateRange) => -dayjs(startDate).unix(),
  ASCENDING: ({ startDate }: SortDateRange) => dayjs(startDate).unix(),
};

type IProps = {
  sortStatus: SortType;
};

export const DateRangePickerGroup = ({ sortStatus }: IProps) => {
  const dispatch = useAppDispatch();
  const dateRangeGroup = useAppSelector(selectDateRange);
  const isAddButtonDisabled = dateRangeGroup.length === MAX_TIME_RANGE_AMOUNT;
  const [sortDateRangeGroup, setSortDateRangeGroup] = useState<SortDateRange[]>(
    dateRangeGroup.map((item, index) => ({ ...item, error: null, sortIndex: index })),
  );

  const dispatchUpdateConfig = () => {
    dispatch(updateShouldGetBoardConfig(true));
    dispatch(updateShouldGetPipelineConfig(true));
    dispatch(initDeploymentFrequencySettings());
  };

  const addRangeHandler = () => {
    const newDateRangeGroup = [...dateRangeGroup, { startDate: null, endDate: null }];
    setSortDateRangeGroup(newDateRangeGroup.map((item, index) => ({ ...item, error: null, sortIndex: index })));
    dispatch(updateDateRange(newDateRangeGroup));
  };

  const handleError = async (error: DateValidationError, index: number) => {
    await setSortDateRangeGroup(
      sortDateRangeGroup.map((item) => ({ ...item, error: item.sortIndex === index ? error : null })),
    );
  };

  const handleChange = (data: { startDate: string | null; endDate: string | null }[]) => {
    setSortDateRangeGroup(data.map((item, index) => ({ ...item, error: null, sortIndex: index })));
    dispatchUpdateConfig();
    dispatch(updateDateRange(data));
  };

  return (
    <DateRangePickerGroupContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {sortBy(sortDateRangeGroup, get(sortFn, sortStatus)).map(({ startDate, endDate, sortIndex }, index) => (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            index={sortIndex}
            key={index}
            onError={handleError}
            onChange={handleChange}
          />
        ))}
        <AddButton
          disabled={isAddButtonDisabled}
          aria-label='Button for adding date range'
          onClick={addRangeHandler}
          text={ADD_TIME_RANGE_BUTTON_TEXT}
          sx={{
            mt: '1.5rem',
          }}
        />
      </LocalizationProvider>
    </DateRangePickerGroupContainer>
  );
};
