import {
  StyledFeaturedRangePickerContainer,
  StyledDateRangePickerContainer,
  StyledDateRangePicker,
  RemoveButton,
  RemoveButtonContainer,
} from '@src/containers/ConfigStep/DateRangePicker/style';
import {
  calculateDateRangeIntersection,
  calculateStartDateShouldDisable,
  calculateEndDateShouldDisable,
} from '@src/containers/ConfigStep/DateRangePicker/validation';
import {
  initDeploymentFrequencySettings,
  saveUsers,
  updateShouldGetBoardConfig,
  updateShouldGetPipelineConfig,
} from '@src/context/Metrics/metricsSlice';
import { DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS, REMOVE_BUTTON_TEXT, DATE_RANGE_FORMAT } from '@src/constants/resources';
import { IRangePickerProps } from '@src/containers/ConfigStep/DateRangePicker/types';
import { selectDateRange, updateDateRange } from '@src/context/config/configSlice';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Z_INDEX } from '@src/constants/commons';
import { Nullable } from '@src/utils/types';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback } from 'react';
import isNull from 'lodash/isNull';

export const DateRangePicker = ({ startDate, endDate, index }: IRangePickerProps) => {
  const dispatch = useAppDispatch();
  const dateRangeGroup = useAppSelector(selectDateRange);
  const isShowRemoveButton = dateRangeGroup.length > 1;
  const dateRangeGroupExcludeSelf = dateRangeGroup.filter((_, idx) => idx !== index);
  const shouldStartDateDisableDate = calculateStartDateShouldDisable.bind(
    null,
    dayjs(endDate),
    dateRangeGroupExcludeSelf,
  );
  const shouldEndDateDisableDate = calculateEndDateShouldDisable.bind(
    null,
    dayjs(startDate),
    dateRangeGroupExcludeSelf,
  );

  const dispatchUpdateConfig = () => {
    dispatch(updateShouldGetBoardConfig(true));
    dispatch(updateShouldGetPipelineConfig(true));
    dispatch(initDeploymentFrequencySettings());
    dispatch(saveUsers([]));
  };

  const changeStartDate = (value: Nullable<Dayjs>) => {
    let daysAddToEndDate = DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS;
    const [earliest, latest] = calculateDateRangeIntersection(dateRangeGroupExcludeSelf);
    if (value) {
      const currentDate = dayjs(new Date());
      let lastAvailableDate: Dayjs = currentDate;
      let draftDaysAddition: number;
      if (earliest.isValid() && latest.isValid()) {
        lastAvailableDate = value.isBefore(earliest) ? earliest.subtract(1, 'day') : currentDate;
      }
      draftDaysAddition = lastAvailableDate.diff(value, 'days');
      daysAddToEndDate =
        draftDaysAddition >= DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS
          ? DEFAULT_SPRINT_INTERVAL_OFFSET_DAYS
          : draftDaysAddition;
    }
    const newDateRangeGroup = dateRangeGroup.map(({ startDate, endDate }, idx) => {
      if (idx === index) {
        return isNull(value)
          ? {
              startDate: null,
              endDate: null,
            }
          : {
              startDate: value.startOf('date').format(DATE_RANGE_FORMAT),
              endDate: value.endOf('date').add(daysAddToEndDate, 'day').format(DATE_RANGE_FORMAT),
            };
      }

      return {
        startDate,
        endDate,
      };
    });
    dispatch(updateDateRange(newDateRangeGroup));
    dispatchUpdateConfig();
  };

  const changeEndDate = (value: Dayjs) => {
    const newDateRangeGroup = dateRangeGroup.map(({ startDate, endDate }, idx) => {
      if (idx === index) {
        return {
          startDate: startDate,
          endDate: !isNull(value) ? value.endOf('date').format('YYYY-MM-DDTHH:mm:ss.SSSZ') : null,
        };
      }

      return { startDate, endDate };
    });
    dispatch(updateDateRange(newDateRangeGroup));
    dispatchUpdateConfig();
  };

  const removeSelfHandler = useCallback(() => {
    const newDateRangeGroup = dateRangeGroup.filter((_, idx) => idx !== index);
    dispatch(updateDateRange(newDateRangeGroup));
  }, [dateRangeGroup]);

  return (
    <StyledFeaturedRangePickerContainer>
      <StyledDateRangePickerContainer className='range-picker-row'>
        <StyledDateRangePicker
          disableFuture
          // todo typescript optimization
          shouldDisableDate={(date) => shouldStartDateDisableDate(date as Dayjs)}
          label='From *'
          value={startDate ? dayjs(startDate) : null}
          onChange={(newValue) => changeStartDate(newValue as unknown as Dayjs)}
          onError={(error, value) => {
            console.log('error', error);
            console.log('value', value);
          }}
          slots={{
            openPickerIcon: CalendarTodayIcon,
          }}
          slotProps={{
            textField: {
              variant: 'standard',
            },
            popper: {
              sx: { zIndex: Z_INDEX.DROPDOWN },
            },
          }}
        />
        <StyledDateRangePicker
          disableFuture
          label='To *'
          // todo typescript optimization
          shouldDisableDate={(date) => shouldEndDateDisableDate(date as Dayjs)}
          value={endDate ? dayjs(endDate) : null}
          maxDate={dayjs(startDate).add(30, 'day')}
          minDate={dayjs(startDate)}
          onChange={(newValue) => changeEndDate(newValue as unknown as Dayjs)}
          slots={{
            openPickerIcon: CalendarTodayIcon,
          }}
          slotProps={{
            textField: {
              variant: 'standard',
            },
            popper: {
              sx: { zIndex: Z_INDEX.DROPDOWN },
            },
          }}
        />
      </StyledDateRangePickerContainer>
      {isShowRemoveButton && (
        <RemoveButtonContainer>
          <RemoveButton onClick={removeSelfHandler}>{REMOVE_BUTTON_TEXT}</RemoveButton>
        </RemoveButtonContainer>
      )}
    </StyledFeaturedRangePickerContainer>
  );
};
