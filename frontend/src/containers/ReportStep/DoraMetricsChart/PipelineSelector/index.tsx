import { PipelinesSelectContainer } from '@src/containers/ReportStep/DoraMetricsChart/PipelineSelector/style';
import { getEmojiUrls, removeExtraEmojiName } from '@src/constants/emojis/emoji';
import { Autocomplete, Box, ListItemText, TextField } from '@mui/material';
import { EmojiWrap, StyledAvatar } from '@src/constants/emojis/style';
import { DEFAULT_HELPER_TEXT, Z_INDEX } from '@src/constants/commons';
import React, { useState } from 'react';

interface Props {
  options: string[];
  value: string;
  onUpDatePipeline: (value: string) => void;
  isError?: boolean;
  errorText?: string;
  title: string;
}

export default function PipelineSelector({ options, value, onUpDatePipeline, isError, errorText, title }: Props) {
  const label = '';
  const [inputValue, setInputValue] = useState<string>(value);
  const emojiView = (pipelineStepName: string) => {
    const emojiUrls: string[] = getEmojiUrls(pipelineStepName);
    return emojiUrls.map((url) => <StyledAvatar key={url} src={url} />);
  };

  return (
    <PipelinesSelectContainer>
      {title}:
      <Autocomplete
        disableClearable
        sx={{
          flex: 1,
          marginLeft: '1rem',
        }}
        data-test-id={'Pipeline Selector'}
        options={options}
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
          onUpDatePipeline(newValue);
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
    </PipelinesSelectContainer>
  );
}
