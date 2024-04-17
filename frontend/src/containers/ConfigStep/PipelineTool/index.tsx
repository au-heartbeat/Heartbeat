import { ConfigSectionContainer, StyledForm, StyledTextField } from '@src/components/Common/ConfigForms';
import { FIELD_KEY, useVerifyPipelineToolEffect } from '@src/hooks/useVerifyPipelineToolEffect';
import { PIPELINE_TOOL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { FormSingleSelect } from '@src/containers/ConfigStep/Form/FormSelect';
import { CONFIG_TITLE, PIPELINE_TOOL_TYPES } from '@src/constants/resources';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { TimeoutAlert } from '@src/containers/ConfigStep/TimeoutAlert';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { Controller, useFormContext } from 'react-hook-form';
import { Loading } from '@src/components/Loading';

export const PipelineTool = () => {
  const { fields, verifyPipelineTool, isLoading, resetFields } = useVerifyPipelineToolEffect();
  const {
    control,
    setError,
    clearErrors,
    formState: { isSubmitSuccessful, errors },
    handleSubmit,
    reset,
  } = useFormContext();
  const isValid = Object.entries(errors).length === 0;
  const isVerifyTimeOut = errors.token?.message === PIPELINE_TOOL_ERROR_MESSAGE.token.timeout;
  const isVerified = isValid && isSubmitSuccessful;

  const onSubmit = async () => await verifyPipelineTool();
  const closeTimeoutAlert = () => clearErrors(fields[FIELD_KEY.TOKEN].key);

  return (
    <ConfigSectionContainer aria-label='Pipeline Tool Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{CONFIG_TITLE.PIPELINE_TOOL}</ConfigSelectionTitle>
      <StyledAlterWrapper>
        <TimeoutAlert showAlert={isVerifyTimeOut} onClose={closeTimeoutAlert} moduleType={'Pipeline Tool'} />
      </StyledAlterWrapper>
      <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={resetFields}>
        <FormSingleSelect
          key={fields[FIELD_KEY.TYPE].key}
          name={fields[FIELD_KEY.TYPE].key}
          options={Object.values(PIPELINE_TOOL_TYPES)}
          labelText='Pipeline Tool'
          labelId='pipelineTool-type-checkbox-label'
          selectLabelId='pipelineTool-type-checkbox-label'
          selectAriaLabel='Pipeline Tool type select'
        />
        <Controller
          name={fields[FIELD_KEY.TOKEN].key}
          control={control}
          render={({ field, fieldState }) => {
            return (
              <StyledTextField
                {...field}
                required
                key={fields[FIELD_KEY.TOKEN].key}
                data-testid='pipelineToolTextField'
                label={fields[FIELD_KEY.TOKEN].key}
                variant='standard'
                type='password'
                inputProps={{ 'aria-label': `input ${fields[FIELD_KEY.TOKEN].key}` }}
                onFocus={() => {
                  if (field.value === '') {
                    setError(fields[FIELD_KEY.TOKEN].key, {
                      message: PIPELINE_TOOL_ERROR_MESSAGE.token.required,
                    });
                  }
                }}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  reset(undefined, { keepValues: true, keepDirty: true, keepTouched: true });
                }}
                error={fieldState.invalid && fieldState.error?.message !== PIPELINE_TOOL_ERROR_MESSAGE.token.timeout}
                helperText={
                  fieldState.error?.message && fieldState.error?.message !== PIPELINE_TOOL_ERROR_MESSAGE.token.timeout
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
