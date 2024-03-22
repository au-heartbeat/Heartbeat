import { DateRangePickerGroupContainer, AddButton } from '@src/containers/ConfigStep/DateRangePicker/style';
import { DateRangePicker } from '@src/containers/ConfigStep/DateRangePicker/DateRangePicker';
import { selectDateRange, updateDateRange } from '@src/context/config/configSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { ADD_TIME_RANGE_BUTTON_TEXT } from '@src/constants/resources';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add } from '@mui/icons-material';

export const DateRangePickerGroup = () => {
  const dispatch = useAppDispatch();
  const dateRangeGroup = useAppSelector(selectDateRange);
  const addRangeHandler = () => {
    const newDateRangeGroup = dateRangeGroup.map((range) => ({ ...range })).concat({ startDate: null, endDate: null });
    dispatch(updateDateRange(newDateRangeGroup));
  };
  return (
    <DateRangePickerGroupContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {dateRangeGroup.map(({ startDate, endDate }, index) => (
          <DateRangePicker startDate={startDate} endDate={endDate} index={index} key={index} />
        ))}
        <AddButton startIcon={<Add />} onClick={addRangeHandler}>
          {ADD_TIME_RANGE_BUTTON_TEXT}
        </AddButton>
      </LocalizationProvider>
    </DateRangePickerGroupContainer>
  );
};
