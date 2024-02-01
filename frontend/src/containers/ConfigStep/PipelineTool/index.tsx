import {
  ConfigSectionContainer,
  StyledButtonGroup,
  StyledForm,
  StyledTextField,
  StyledTypeSelections,
} from '@src/components/Common/ConfigForms';
import {
  isPipelineToolVerified,
  selectPipelineTool,
  updatePipelineTool,
  updatePipelineToolVerifyState,
} from '@src/context/config/configSlice';
import { CONFIG_TITLE, PIPELINE_TOOL_TYPES, TOKEN_HELPER_TEXT } from '@src/constants/resources';
import { useVerifyPipelineToolEffect } from '@src/hooks/useVerifyPipelineToolEffect';
import { ResetButton, VerifyButton } from '@src/components/Common/Buttons';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { DEFAULT_HELPER_TEXT, EMPTY_STRING } from '@src/constants/commons';
import { InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { findCaseInsensitiveType } from '@src/utils/util';
import { FormEvent, useEffect, useState } from 'react';
import { Loading } from '@src/components/Loading';
import { REGEX } from '@src/constants/regex';

export const PipelineTool = () => {
  const dispatch = useAppDispatch();
  const pipelineToolFields = useAppSelector(selectPipelineTool);
  const isVerified = useAppSelector(isPipelineToolVerified);
  const { verifyPipelineTool, isLoading, errorMessage, clearErrorMessage } = useVerifyPipelineToolEffect();
  const type = findCaseInsensitiveType(Object.values(PIPELINE_TOOL_TYPES), pipelineToolFields.type);
  const [fields, setFields] = useState([
    {
      key: 'PipelineTool',
      value: type,
      isValid: true,
    },
    {
      key: 'Token',
      value: pipelineToolFields.token,
      isValid: true,
    },
  ]);
  const [isDisableVerifyButton, setIsDisableVerifyButton] = useState(true);

  useEffect(() => {
    const isAllFieldsValid = (fields: { key: string; value: string; isValid: boolean }[]) =>
      fields.every((field) => field.isValid && !!field.value && !errorMessage);
    setIsDisableVerifyButton(!isAllFieldsValid(fields));
  }, [clearErrorMessage, errorMessage, fields]);

  const handleUpdate = (fields: { key: string; value: string; isValid: boolean }[]) => {
    setFields(fields);
    dispatch(updatePipelineToolVerifyState(false));
    dispatch(
      updatePipelineTool({
        type: fields[0].value,
        token: fields[1].value,
      }),
    );
  };

  const onSelectUpdate = (value: string) => {
    clearErrorMessage();
    const newFields = fields.map(({ key }, index) => ({
      key,
      value: index === 0 ? value : EMPTY_STRING,
      isValid: true,
    }));
    handleUpdate(newFields);
  };

  const onInputUpdate = (value: string) => {
    clearErrorMessage();
    const newFields = fields.map((field, index) =>
      index === 0
        ? field
        : {
            key: field.key,
            value: value.trim(),
            isValid: REGEX.BUILDKITE_TOKEN.test(value.trim()),
          },
    );
    handleUpdate(newFields);
  };

  const updateFieldHelpText = () => {
    const { value, isValid } = fields[1];
    if (!value) {
      return TOKEN_HELPER_TEXT.RequiredTokenText;
    }
    if (errorMessage) {
      return errorMessage;
    }
    if (!isValid) {
      return TOKEN_HELPER_TEXT.InvalidTokenText;
    }
    return DEFAULT_HELPER_TEXT;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyPipelineTool({
      type: fields[0].value,
      token: fields[1].value,
    });
  };

  const onReset = () => {
    const newFields = fields.map(({ key }, index) => ({
      key,
      value: index === 0 ? PIPELINE_TOOL_TYPES.BUILD_KITE : EMPTY_STRING,
      isValid: true,
    }));
    handleUpdate(newFields);
  };

  return (
    <ConfigSectionContainer aria-label='Pipeline Tool Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{CONFIG_TITLE.PIPELINE_TOOL}</ConfigSelectionTitle>
      <StyledForm onSubmit={onSubmit} onReset={onReset}>
        <StyledTypeSelections variant='standard' required>
          <InputLabel id='pipelineTool-type-checkbox-label'>Pipeline Tool</InputLabel>
          <Select
            labelId='pipelineTool-type-checkbox-label'
            aria-label='Pipeline Tool type select'
            value={fields[0].value}
            onChange={(e) => onSelectUpdate(e.target.value)}
          >
            {Object.values(PIPELINE_TOOL_TYPES).map((toolType) => (
              <MenuItem key={toolType} value={toolType}>
                <ListItemText primary={toolType} />
              </MenuItem>
            ))}
          </Select>
        </StyledTypeSelections>
        <StyledTextField
          data-testid='pipelineToolTextField'
          key={fields[1].key}
          required
          label={fields[1].key}
          variant='standard'
          type='password'
          inputProps={{
            'aria-label': `input ${fields[1].key}`,
          }}
          value={fields[1].value}
          onChange={(e) => onInputUpdate(e.target.value)}
          error={!fields[1].isValid || !fields[1].value || !!errorMessage}
          helperText={updateFieldHelpText()}
        />
        <StyledButtonGroup>
          {isVerified && !isLoading ? (
            <VerifyButton disabled>Verified</VerifyButton>
          ) : (
            <VerifyButton type='submit' disabled={isDisableVerifyButton || isLoading}>
              Verify
            </VerifyButton>
          )}
          {isVerified && !isLoading && <ResetButton type='reset'>Reset</ResetButton>}
        </StyledButtonGroup>
      </StyledForm>
    </ConfigSectionContainer>
  );
};
