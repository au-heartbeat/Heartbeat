import { selectWarningMessage, updateCalendarType, updateProjectName } from '@src/context/config/configSlice';
import { CollectionDateLabel, ProjectNameInput, StyledFormControlLabel } from './style';
import { RequiredMetrics } from '@src/containers/ConfigStep/BasicInfo/RequiredMetrics';
import { DateRangePickerSection } from '@src/containers/ConfigStep/DateRangePicker';
import { BASIC_INFO_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import { ConfigSectionContainer } from '@src/components/Common/ConfigForms';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { CALENDAR_LABEL, CALENDAR_LIST } from '@src/constants/resources';
import { FormControl, Radio, RadioGroup } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

const BasicInfo = () => {
  const dispatch = useAppDispatch();
  const warningMessage = useAppSelector(selectWarningMessage);
  const { setError, control } = useFormContext();

  return (
    <>
      {warningMessage && <WarningNotification message={warningMessage} />}
      <ConfigSectionContainer aria-label='Basic information'>
        <ConfigSelectionTitle>Basic information</ConfigSelectionTitle>
        <Controller
          name={'projectName'}
          control={control}
          render={({ field, fieldState }) => (
            <ProjectNameInput
              required
              label='Project name'
              variant='standard'
              {...field}
              onChange={(e) => {
                dispatch(updateProjectName(e.target.value));
                field.onChange(e.target.value);
              }}
              onFocus={() => {
                if (field.value === '') {
                  setError('projectName', { message: BASIC_INFO_ERROR_MESSAGE.projectName.required });
                }
              }}
              error={fieldState.invalid}
              helperText={fieldState.error?.message || ''}
            />
          )}
        />

        <FormControl required>
          <CollectionDateLabel>Collection date (Weekend considered)</CollectionDateLabel>
          <Controller
            name={'calendarType'}
            control={control}
            render={({ field }) => {
              return (
                <RadioGroup
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    dispatch(updateCalendarType(e.target.value));
                  }}
                >
                  {CALENDAR_LIST.map((calendarType) => (
                    <StyledFormControlLabel
                      key={calendarType}
                      value={calendarType}
                      control={<Radio />}
                      name={CALENDAR_LABEL[calendarType]}
                      label={CALENDAR_LABEL[calendarType]}
                    />
                  ))}
                </RadioGroup>
              );
            }}
          />
        </FormControl>
        <DateRangePickerSection />
        <RequiredMetrics />
      </ConfigSectionContainer>
    </>
  );
};

export default BasicInfo;
