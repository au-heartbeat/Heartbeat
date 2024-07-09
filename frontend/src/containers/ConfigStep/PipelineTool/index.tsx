import { ConfigSectionContainer, StyledForm, StyledTextField } from '@src/components/Common/ConfigForms';
import { FieldKey, useVerifyPipelineToolEffect } from '@src/hooks/useVerifyPipelineToolEffect';
import { PIPELINE_TOOL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { FormSingleSelect } from '@src/containers/ConfigStep/Form/FormSelect';
import { ConfigTitle, PIPELINE_TOOL_TYPES } from '@src/constants/resources';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { IPipelineToolData } from '@src/containers/ConfigStep/Form/schema';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { updatePipelineTool } from '@src/context/config/configSlice';
import { FormAlert } from '@src/containers/ConfigStep/FormAlert';
import { Controller, useFormContext } from 'react-hook-form';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { formAlertTypes } from '@src/constants/commons';
import { Loading } from '@src/components/Loading';
import { useEffect } from 'react';

export const PipelineTool = () => {
  const dispatch = useAppDispatch();
  const { fields, verifyPipelineTool, isLoading, resetFields } = useVerifyPipelineToolEffect();
  const {
    control,
    setError,
    clearErrors,
    formState: { isValid, isSubmitSuccessful, errors },
    handleSubmit,
    reset,
    getValues,
  } = useFormContext();
  const isVerifyTimeOut = errors.token?.message === PIPELINE_TOOL_ERROR_MESSAGE.token.timeout;
  const isVerified = isValid && isSubmitSuccessful;

  const onSubmit = async () => await verifyPipelineTool();
  const closeTimeoutAlert = () => clearErrors(fields[FieldKey.Token].key);

  useEffect(() => {
    if (!isVerified) {
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified]);

  return (
    <ConfigSectionContainer aria-label='Pipeline Tool Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{ConfigTitle.PipelineTool}</ConfigSelectionTitle>
      <StyledAlterWrapper>
        <FormAlert
          showAlert={isVerifyTimeOut}
          onClose={closeTimeoutAlert}
          moduleType={'Pipeline Tool'}
          formAlertType={formAlertTypes.Timeout}
        />
      </StyledAlterWrapper>
      <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={resetFields}>
        <FormSingleSelect
          key={fields[FieldKey.Type].key}
          name={fields[FieldKey.Type].key}
          options={Object.values(PIPELINE_TOOL_TYPES)}
          labelText={fields[FieldKey.Type].label}
          labelId='pipelineTool-type-checkbox-label'
          selectLabelId='pipelineTool-type-checkbox-label'
          selectAriaLabel='Pipeline Tool type select'
        />
        <Controller
          name={fields[FieldKey.Token].key}
          control={control}
          render={({ field, fieldState }) => {
            return (
              <StyledTextField
                {...field}
                required
                key={fields[FieldKey.Token].key}
                data-testid='pipelineToolTextField'
                label={fields[FieldKey.Token].label}
                variant='standard'
                type='password'
                inputProps={{ 'aria-label': `input ${fields[FieldKey.Token].key}` }}
                onFocus={() => {
                  if (field.value === '') {
                    setError(fields[FieldKey.Token].key, {
                      message: PIPELINE_TOOL_ERROR_MESSAGE.token.required,
                    });
                  }
                }}
                onChange={(e) => {
                  if (isSubmitSuccessful) {
                    reset(undefined, { keepValues: true, keepErrors: true });
                  }
                  const pipelineToolConfig: IPipelineToolData = {
                    ...getValues(),
                    token: e.target.value,
                  };
                  dispatch(updatePipelineTool(pipelineToolConfig));
                  field.onChange(e.target.value);
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
