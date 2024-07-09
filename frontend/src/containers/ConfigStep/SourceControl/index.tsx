import { FieldKey, useVerifySourceControlTokenEffect } from '@src/hooks/useVerifySourceControlTokenEffect';
import { ConfigSectionContainer, StyledForm, StyledTextField } from '@src/components/Common/ConfigForms';
import { SOURCE_CONTROL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { FormSingleSelect } from '@src/containers/ConfigStep/Form/FormSelect';
import { ISourceControlData } from '@src/containers/ConfigStep/Form/schema';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { ConfigTitle, SourceControlTypes } from '@src/constants/resources';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { updateSourceControl } from '@src/context/config/configSlice';
import { FormAlert } from '@src/containers/ConfigStep/FormAlert';
import { Controller, useFormContext } from 'react-hook-form';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { formAlertTypes } from '@src/constants/commons';
import { Loading } from '@src/components/Loading';
import { useEffect } from 'react';

export const SourceControl = () => {
  const dispatch = useAppDispatch();
  const { fields, verifyToken, isLoading, resetFields } = useVerifySourceControlTokenEffect();
  const {
    control,
    setError,
    clearErrors,
    formState: { isValid, isSubmitSuccessful, errors },
    handleSubmit,
    reset,
    getValues,
  } = useFormContext();
  const isVerifyTimeOut = errors.token?.message === SOURCE_CONTROL_ERROR_MESSAGE.token.timeout;
  const isVerified = isValid && isSubmitSuccessful;

  const onSubmit = async () => await verifyToken();
  const closeTimeoutAlert = () => clearErrors(fields[FieldKey.Token].key);

  useEffect(() => {
    if (!isVerified) {
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified]);

  return (
    <ConfigSectionContainer aria-label='Source Control Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{ConfigTitle.SourceControl}</ConfigSelectionTitle>
      <StyledAlterWrapper>
        <FormAlert
          showAlert={isVerifyTimeOut}
          onClose={closeTimeoutAlert}
          moduleType={'Source Control'}
          formAlertType={formAlertTypes.Timeout}
        />
      </StyledAlterWrapper>
      <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={resetFields}>
        <FormSingleSelect
          key={fields[FieldKey.Type].key}
          name={fields[FieldKey.Type].key}
          options={Object.values(SourceControlTypes)}
          labelText={fields[FieldKey.Type].label}
          labelId='sourceControl-type-checkbox-label'
          selectLabelId='sourceControl-type-checkbox-label'
        />
        <Controller
          name={fields[FieldKey.Token].key}
          control={control}
          render={({ field, fieldState }) => {
            return (
              <StyledTextField
                {...field}
                data-testid='sourceControlTextField'
                key={fields[FieldKey.Token].key}
                required
                label={fields[FieldKey.Token].label}
                variant='standard'
                type='password'
                inputProps={{ 'aria-label': `input ${fields[FieldKey.Token].key}` }}
                onFocus={() => {
                  if (field.value === '') {
                    setError(fields[FieldKey.Token].key, {
                      message: SOURCE_CONTROL_ERROR_MESSAGE.token.required,
                    });
                  }
                }}
                onChange={(e) => {
                  if (isSubmitSuccessful) {
                    reset(undefined, { keepValues: true, keepErrors: true });
                  }
                  const sourceControl: ISourceControlData = {
                    ...getValues(),
                    token: e.target.value,
                  };
                  dispatch(updateSourceControl(sourceControl));
                  field.onChange(e.target.value);
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
