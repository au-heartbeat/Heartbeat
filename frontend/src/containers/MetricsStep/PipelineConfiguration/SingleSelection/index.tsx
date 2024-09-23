import {
  IPipelineConfig,
  ISourceControlConfig,
  selectPipelineSettings,
  selectSourceControlConfigurationSettings,
} from '@src/context/Metrics/metricsSlice';
import { getEmojiUrls, removeExtraEmojiName } from '@src/constants/emojis/emoji';
import { initSinglePipelineListBranches } from '@src/context/meta/metaSlice';
import { Autocomplete, Box, ListItemText, TextField } from '@mui/material';
import { getDisabledOptions, sortDisabledOptions } from '@src/utils/util';
import { EmojiWrap, StyledAvatar } from '@src/constants/emojis/style';
import { DEFAULT_HELPER_TEXT, Z_INDEX } from '@src/constants/commons';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { FormControlWrapper } from './style';
import { useAppSelector } from '@src/hooks';
import React, { useState } from 'react';

interface Props {
  options: string[];
  label: string;
  value: string;
  id: number;
  isError?: boolean;
  errorText?: string;
  onGetSteps?: (pipelineName: string) => void;
  onUpdate: (id: number, label: string, value: string | []) => void;
}

export const SingleSelection = ({
  options,
  label,
  value,
  id,
  isError = false,
  errorText,
  onGetSteps,
  onUpdate,
}: Props) => {
  const labelId = `single-selection-${label.toLowerCase().replace(' ', '-')}`;
  const [inputValue, setInputValue] = useState<string>(value);
  const deploymentFrequencySettings = useAppSelector(selectPipelineSettings);
  const sourceControlConfigurationSettings = useAppSelector(selectSourceControlConfigurationSettings);
  let settings: IPipelineConfig[] | ISourceControlConfig[];
  if (label === 'Pipeline Name') {
    settings = deploymentFrequencySettings;
  } else {
    settings = sourceControlConfigurationSettings;
  }
  const dispatch = useAppDispatch();

  const handleSelectedOptionsChange = (value: string) => {
    if (onGetSteps) {
      onUpdate(id, 'Step', '');
      onUpdate(id, 'Branches', []);
      onGetSteps(value);
      dispatch(initSinglePipelineListBranches(id));
    }
    onUpdate(id, label, value);
  };

  const emojiView = (pipelineStepName: string) => {
    const emojiUrls: string[] = getEmojiUrls(pipelineStepName);
    return emojiUrls.map((url) => <StyledAvatar key={url} src={url} />);
  };

  return (
    <>
      <FormControlWrapper variant='standard' required>
        <Autocomplete
          disableClearable
          data-test-id={labelId}
          options={sortDisabledOptions(settings, options, deploymentFrequencySettings)}
          getOptionDisabled={(option: string) => getDisabledOptions(settings, option, deploymentFrequencySettings)}
          getOptionLabel={(option: string) => removeExtraEmojiName(option).trim()}
          renderOption={(props, option: string) => (
            <Box component='li' {...props}>
              <EmojiWrap>
                {emojiView(option)}
                <ListItemText primary={removeExtraEmojiName(option)} data-test-id={'single-option'} />
              </EmojiWrap>
            </Box>
          )}
          value={value}
          onChange={(event, newValue: string) => {
            handleSelectedOptionsChange(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              required
              {...params}
              label={label}
              variant='standard'
              error={isError}
              helperText={isError ? errorText : DEFAULT_HELPER_TEXT}
            />
          )}
          slotProps={{
            popper: {
              sx: {
                zIndex: Z_INDEX.DROPDOWN,
              },
            },
          }}
        />
      </FormControlWrapper>
    </>
  );
};
