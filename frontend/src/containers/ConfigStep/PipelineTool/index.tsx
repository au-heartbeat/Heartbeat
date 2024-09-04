import {
  ConfigTitle,
  DORA_METRICS,
  PIPELINE_TOOL_OTHER_OPTION,
  PIPELINE_TOOL_TYPES,
  RequiredData,
} from '@src/constants/resources';
import { ConfigSectionContainer, StyledForm, StyledTextField } from '@src/components/Common/ConfigForms';
import { selectMetrics, selectPipelineTool, updatePipelineTool } from '@src/context/config/configSlice';
import { FieldKey, useVerifyPipelineToolEffect } from '@src/hooks/useVerifyPipelineToolEffect';
import { PIPELINE_TOOL_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { FormSingleSelect } from '@src/containers/ConfigStep/Form/FormSelect';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { IPipelineToolData } from '@src/containers/ConfigStep/Form/schema';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { FormAlert } from '@src/containers/ConfigStep/FormAlert';
import { Controller, useFormContext } from 'react-hook-form';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { formAlertTypes } from '@src/constants/commons';
import { Loading } from '@src/components/Loading';
import { useAppSelector } from '@src/hooks';
import { useEffect, useState } from 'react';

export const PipelineTool = ({
  onReset,
  onSetResetFields,
}: {
  onReset: () => void;
  onSetResetFields: (resetFunc: () => void) => void;
}) => {
  const dispatch = useAppDispatch();
  const metrics = useAppSelector(selectMetrics);
  const pipelineToolConfig = useAppSelector(selectPipelineTool);
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
  const [selectedOption, setSelectedOption] = useState<string>(pipelineToolConfig.type);

  const updateSelectedOption = (value: string) => {
    setSelectedOption(value);
    const pipelineToolConfig: IPipelineToolData = {
      type: value,
      token: getValues()['token'],
    };
    dispatch(updatePipelineTool(pipelineToolConfig));
  };

  const onSubmit = async () => await verifyPipelineTool();
  const closeTimeoutAlert = () => clearErrors(fields[FieldKey.Token].key);

  useEffect(() => {
    if (!isVerified) {
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified]);

  const options = Object.values(PIPELINE_TOOL_TYPES);
  const isSelectLeadTimeForChanges = metrics.some((it) => it === RequiredData.LeadTimeForChanges);
  const isSelectDoraMetricsExceptLeadTimeForChanges = metrics.some(
    (it) => it !== RequiredData.LeadTimeForChanges && DORA_METRICS.some((doraMetrics) => doraMetrics === it),
  );
  if (isSelectLeadTimeForChanges && !isSelectDoraMetricsExceptLeadTimeForChanges) {
    options.push(PIPELINE_TOOL_OTHER_OPTION);
  }

  if (selectedOption === PIPELINE_TOOL_OTHER_OPTION && isSelectDoraMetricsExceptLeadTimeForChanges) {
    updateSelectedOption(PIPELINE_TOOL_TYPES.BUILD_KITE);
  }

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
      <StyledForm
        onSubmit={handleSubmit(onSubmit)}
        onReset={() => {
          onSetResetFields(resetFields);
          onReset();
        }}
      >
        <FormSingleSelect
          key={fields[FieldKey.Type].key}
          name={fields[FieldKey.Type].key}
          options={options}
          value={selectedOption}
          updateValue={updateSelectedOption}
          labelText={fields[FieldKey.Type].label}
          labelId='pipelineTool-type-checkbox-label'
          selectLabelId='pipelineTool-type-checkbox-label'
          selectAriaLabel='Pipeline Tool type select'
        />
        {selectedOption !== PIPELINE_TOOL_OTHER_OPTION && (
          <>
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
                    error={
                      fieldState.invalid && fieldState.error?.message !== PIPELINE_TOOL_ERROR_MESSAGE.token.timeout
                    }
                    helperText={
                      fieldState.error?.message &&
                      fieldState.error?.message !== PIPELINE_TOOL_ERROR_MESSAGE.token.timeout
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
          </>
        )}
      </StyledForm>
    </ConfigSectionContainer>
  );
};
