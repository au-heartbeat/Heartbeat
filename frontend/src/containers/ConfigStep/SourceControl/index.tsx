import {
  ConfigSectionContainer,
  StyledButtonGroup,
  StyledForm,
  StyledTextField,
  StyledTypeSelections,
} from '@src/components/Common/ConfigForms';
import {
  isSourceControlVerified,
  selectSourceControl,
  updateSourceControl,
  updateSourceControlVerifyState,
} from '@src/context/config/configSlice';
import { useVerifySourceControlTokenEffect } from '@src/hooks/useVerifySourceControlTokenEffect';
import { CONFIG_TITLE, SOURCE_CONTROL_TYPES, TOKEN_HELPER_TEXT } from '@src/constants/resources';
import { ResetButton, VerifyButton } from '@src/components/Common/Buttons';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { DEFAULT_HELPER_TEXT } from '@src/constants/commons';
import { findCaseInsensitiveType } from '@src/utils/util';
import { FormEvent, useMemo, useState } from 'react';
import { Loading } from '@src/components/Loading';
import { REGEX } from '@src/constants/regex';

enum FIELD_KEY {
  TYPE = 0,
  TOKEN = 1,
}

export const SourceControl = () => {
  const dispatch = useAppDispatch();
  const sourceControlFields = useAppSelector(selectSourceControl);
  const isVerified = useAppSelector(isSourceControlVerified);
  const { verifyToken, isLoading, errorMessage, clearErrorMessage } = useVerifySourceControlTokenEffect();
  const type = findCaseInsensitiveType(Object.values(SOURCE_CONTROL_TYPES), sourceControlFields.type);
  const [fields, setFields] = useState([
    {
      key: 'SourceControl',
      value: type,
      isValid: true,
    },
    {
      key: 'Token',
      value: sourceControlFields.token,
      isValid: REGEX.GITHUB_TOKEN.test(sourceControlFields.token),
    },
  ]);

  const handleUpdate = (fields: { key: string; value: string; isValid: boolean }[]) => {
    clearErrorMessage();
    setFields(fields);
    dispatch(updateSourceControlVerifyState(false));
    dispatch(
      updateSourceControl({
        type: fields[FIELD_KEY.TYPE].value,
        token: fields[FIELD_KEY.TOKEN].value,
      }),
    );
  };

  const onInputChange = (value: string) => {
    const newFields = fields.map((field, index) =>
      index === FIELD_KEY.TOKEN
        ? {
            key: field.key,
            value: value.trim(),
            isValid: REGEX.GITHUB_TOKEN.test(value.trim()),
          }
        : field,
    );
    handleUpdate(newFields);
  };

  const onReset = () => {
    const newFields = fields.map(({ key }, index) => ({
      key,
      value: index === FIELD_KEY.TOKEN ? '' : SOURCE_CONTROL_TYPES.GITHUB,
      isValid: true,
    }));
    handleUpdate(newFields);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyToken({
      type: fields[FIELD_KEY.TYPE].value as SOURCE_CONTROL_TYPES,
      token: fields[FIELD_KEY.TOKEN].value,
    });
  };

  const isDisableVerifyButton = useMemo(
    () => isLoading || !fields.every((field) => field.isValid && !!field.value) || !!errorMessage,
    [errorMessage, fields, isLoading],
  );

  const sourceControlHelperText = useMemo(() => {
    const { value, isValid } = fields[FIELD_KEY.TOKEN];
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
  }, [errorMessage, fields]);

  return (
    <ConfigSectionContainer aria-label='Source Control Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{CONFIG_TITLE.SOURCE_CONTROL}</ConfigSelectionTitle>
      <StyledForm onSubmit={onSubmit} onReset={onReset}>
        <StyledTypeSelections variant='standard' required>
          <InputLabel id='sourceControl-type-checkbox-label'>Source Control</InputLabel>
          <Select labelId='sourceControl-type-checkbox-label' value={fields[FIELD_KEY.TYPE].value}>
            {Object.values(SOURCE_CONTROL_TYPES).map((toolType) => (
              <MenuItem key={toolType} value={toolType}>
                <ListItemText primary={toolType} />
              </MenuItem>
            ))}
          </Select>
        </StyledTypeSelections>
        <StyledTextField
          data-testid='sourceControlTextField'
          key={fields[FIELD_KEY.TOKEN].key}
          required
          label={fields[FIELD_KEY.TOKEN].key}
          variant='standard'
          type='password'
          value={fields[FIELD_KEY.TOKEN].value}
          onChange={(e) => onInputChange(e.target.value)}
          error={!!sourceControlHelperText}
          helperText={sourceControlHelperText}
        />
        <StyledButtonGroup>
          {isVerified && !isLoading ? (
            <>
              <VerifyButton disabled>Verified</VerifyButton>
              <ResetButton type='reset'>Reset</ResetButton>
            </>
          ) : (
            <VerifyButton type='submit' disabled={isDisableVerifyButton}>
              Verify
            </VerifyButton>
          )}
        </StyledButtonGroup>
      </StyledForm>
    </ConfigSectionContainer>
  );
};
