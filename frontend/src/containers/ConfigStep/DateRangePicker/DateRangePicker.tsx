import {
  StyledFeaturedRangePickerContainer,
  StyledDateRangePickerContainer,
  StyledDateRangePicker,
  RemoveButton,
} from '@src/containers/ConfigStep/DateRangePicker/style';
import {
  DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS,
  REMOVE_BUTTON_TEXT,
  DATE_RANGE_FORMAT,
  START_DATE_INVALID_TEXT,
  END_DATE_INVALID_TEXT,
} from '@src/constants/resources';
import { isDateDisabled, calculateLastAvailableDate } from '@src/containers/ConfigStep/DateRangePicker/validation';
import { IRangePickerProps } from '@src/containers/ConfigStep/DateRangePicker/types';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { selectDateRange } from '@src/context/config/configSlice';
import { useAppSelector } from '@src/hooks/useAppDispatch';
import { DateValidationError } from '@mui/x-date-pickers';
import { TextField, TextFieldProps } from '@mui/material';
import { Z_INDEX } from '@src/constants/commons';
import { Nullable } from '@src/utils/types';
import dayjs, { Dayjs } from 'dayjs';
import isNull from 'lodash/isNull';

const HelperTextForStartDate = (props: TextFieldProps) => (
  <TextField {...props} variant='standard' helperText={props.error ? START_DATE_INVALID_TEXT : ''} />
);

const HelperTextForEndDate = (props: TextFieldProps) => (
  <TextField {...props} variant='standard' helperText={props.error ? END_DATE_INVALID_TEXT : ''} />
);

export const DateRangePicker = ({
  startDate,
  endDate,
  index,
  onError,
  onChange,
  onRemove,
  allRange,
}: IRangePickerProps) => {
  const isShowRemoveButton = allRange.length > 1;
  const dateRangeGroupExcludeSelf = allRange.filter(({sortIndex},) => sortIndex !== index);
  const shouldStartDateDisableDate = isDateDisabled.bind(null, dateRangeGroupExcludeSelf);
  const shouldEndDateDisableDate = isDateDisabled.bind(null, dateRangeGroupExcludeSelf);

  const changeStartDate = (value: Nullable<Dayjs>,  { validationError }: { validationError: DateValidationError }) => {
    let daysAddToEndDate = DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS;
    if (value) {
      const valueDate = dayjs(value).startOf('day').format(DATE_RANGE_FORMAT);
      const lastAvailableDate = calculateLastAvailableDate(value, dateRangeGroupExcludeSelf);
      const draftDaysAddition = lastAvailableDate.diff(valueDate, 'days');
      daysAddToEndDate =
        draftDaysAddition >= DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS
          ? DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS
          : draftDaysAddition;
    }

    const result = isNull(value)
    ? {
        startDate: null,
        endDate: null,
      }
    : {
        startDate: value.startOf('date').format(DATE_RANGE_FORMAT),
        endDate: value.endOf('date').add(daysAddToEndDate, 'day').format(DATE_RANGE_FORMAT),
      }

      isNull(validationError) ? onChange?.(result, index):onError?.('startDateError', validationError, index);
  };

  const changeEndDate = (value: Nullable<Dayjs>,  { validationError }: { validationError: DateValidationError }) => {
    isNull(validationError) ? onError?.('endDateError', validationError, index) : onChange?.({
      startDate,
      endDate: !isNull(value) ? value.endOf('date').format(DATE_RANGE_FORMAT) : null,
    }, index);
  };

  const removeSelfHandler = () => {
    onRemove?.(index);
  };

  return (
    <StyledFeaturedRangePickerContainer>
      <StyledDateRangePickerContainer className='range-picker-row' aria-label='Range picker row'>
        <StyledDateRangePicker
          disableFuture
          shouldDisableDate={shouldStartDateDisableDate}
          label='From *'
          value={startDate ? dayjs(startDate) : null}
          onChange={changeStartDate}
          slots={{
            openPickerIcon: CalendarTodayIcon,
            textField: HelperTextForStartDate,
          }}
          slotProps={{
            popper: {
              sx: { zIndex: Z_INDEX.DROPDOWN },
            },
          }}
        />
        <StyledDateRangePicker
          disableFuture
          label='To *'
          shouldDisableDate={shouldEndDateDisableDate}
          value={endDate ? dayjs(endDate) : null}
          maxDate={dayjs(startDate).add(30, 'day')}
          minDate={dayjs(startDate)}
          onChange={changeEndDate}
          slots={{
            openPickerIcon: CalendarTodayIcon,
            textField: HelperTextForEndDate,
          }}
          slotProps={{
            popper: {
              sx: { zIndex: Z_INDEX.DROPDOWN },
            },
          }}
        />
        {isShowRemoveButton && <RemoveButton onClick={removeSelfHandler}>{REMOVE_BUTTON_TEXT}</RemoveButton>}
      </StyledDateRangePickerContainer>
    </StyledFeaturedRangePickerContainer>
  );
};
