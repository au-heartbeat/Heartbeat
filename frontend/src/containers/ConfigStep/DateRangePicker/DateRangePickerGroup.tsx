import { DateRangePickerGroupContainer, AddButton } from '@src/containers/ConfigStep/DateRangePicker/style';
import { DateRangePicker } from '@src/containers/ConfigStep/DateRangePicker/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ADD_TIME_RANGE_BUTTON_TEXT } from '@src/constants/resources';
import { selectDateRange } from '@src/context/config/configSlice';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { Add } from '@mui/icons-material';

export const DateRangePickerGroup = () => {
  const dateRangeGroup = useAppSelector(selectDateRange);
  // todo add time range
  const addRangeHandler = () => console.log('add button clicked');
  return (
    <DateRangePickerGroupContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {dateRangeGroup.map(({ startDate, endDate }, index) => (
          <DateRangePicker startDate={startDate} endDate={endDate} index={index} />
        ))}
        <AddButton startIcon={<Add />} onClick={addRangeHandler}>
          {ADD_TIME_RANGE_BUTTON_TEXT}
        </AddButton>
      </LocalizationProvider>
    </DateRangePickerGroupContainer>
  );
};
