import { FIELD_KEY, useVerifySourceControlTokenEffect } from '@src/hooks/useVerifySourceControlTokenEffect';
import { ConfigSectionContainer, StyledForm, StyledTextField } from '@src/components/Common/ConfigForms';
import { SOURCE_CONTROL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { FormSingleSelect } from '@src/containers/ConfigStep/Form/FormSelect';
import { CONFIG_TITLE, SOURCE_CONTROL_TYPES } from '@src/constants/resources';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { TimeoutAlert } from '@src/containers/ConfigStep/TimeoutAlert';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { Controller, useFormContext } from 'react-hook-form';
import { Loading } from '@src/components/Loading';

export const SourceControl = () => {
  const { fields, verifyToken, isLoading, resetFields } = useVerifySourceControlTokenEffect();
  const {
    control,
    setError,
    clearErrors,
    formState: { isValid, isSubmitSuccessful, errors },
    handleSubmit,
    reset,
  } = useFormContext();
  const isVerifyTimeOut = errors.token?.message === SOURCE_CONTROL_ERROR_MESSAGE.token.timeout;
  const isVerified = isValid && isSubmitSuccessful;

  const onSubmit = async () => await verifyToken();
  const closeTimeoutAlert = () => clearErrors(fields[FIELD_KEY.TOKEN].key);

  return (
    <ConfigSectionContainer aria-label='Source Control Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{CONFIG_TITLE.SOURCE_CONTROL}</ConfigSelectionTitle>
      <StyledAlterWrapper>
        <TimeoutAlert showAlert={isVerifyTimeOut} onClose={closeTimeoutAlert} moduleType={'Source Control'} />
      </StyledAlterWrapper>
      <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={resetFields}>
        <FormSingleSelect
          key={fields[FIELD_KEY.TYPE].key}
          name={fields[FIELD_KEY.TYPE].key}
          options={Object.values(SOURCE_CONTROL_TYPES)}
          labelText='Source Control'
          labelId='sourceControl-type-checkbox-label'
          selectLabelId='sourceControl-type-checkbox-label'
        />
        <Controller
          name={fields[FIELD_KEY.TOKEN].key}
          control={control}
          render={({ field, fieldState }) => {
            return (
              <StyledTextField
                {...field}
                data-testid='sourceControlTextField'
                key={fields[FIELD_KEY.TOKEN].key}
                required
                label={fields[FIELD_KEY.TOKEN].key}
                variant='standard'
                type='password'
                inputProps={{ 'aria-label': `input ${fields[FIELD_KEY.TOKEN].key}` }}
                onFocus={() => {
                  if (field.value === '') {
                    setError(fields[FIELD_KEY.TOKEN].key, {
                      message: SOURCE_CONTROL_ERROR_MESSAGE.token.required,
                    });
                  }
                }}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  reset(undefined, { keepValues: true, keepDirty: true, keepTouched: true });
                }}
                error={fieldState.invalid && fieldState.error?.message !== SOURCE_CONTROL_ERROR_MESSAGE.token.timeout}
                helperText={
                  fieldState.error?.message && fieldState.error?.message !== SOURCE_CONTROL_ERROR_MESSAGE.token.timeout
                    ? fieldState.error?.message
                    : ''
                }
              />
            );
          }}
        />
        <ConfigButtonGrop
          isVerifyTimeOut={isVerifyTimeOut}
          isVerified={isVerified}
          isDisableVerifyButton={!isValid}
          isLoading={isLoading}
        />
      </StyledForm>
    </ConfigSectionContainer>
  );
};
