import { PipelinesSelectContainer } from '@src/containers/ReportStep/DoraMetricsChart/PipelineSelector/style';
import { Autocomplete, Box, ListItemText, TextField, Tooltip } from '@mui/material';
import { getEmojiUrls, removeExtraEmojiName } from '@src/constants/emojis/emoji';
import { EmojiWrap, StyledAvatar } from '@src/constants/emojis/style';
import { EMPTY_STRING, Z_INDEX } from '@src/constants/commons';
import React, { useState } from 'react';

interface Props {
  readonly options: string[];
  readonly value: string;
  readonly onUpDatePipeline: (value: string) => void;
  readonly title: string;
}

export default function PipelineSelector({ options, value, onUpDatePipeline, title }: Props) {
  const label = EMPTY_STRING;
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
          minWidth: '22rem',
        }}
        aria-label={'Pipeline Selector'}
        options={options}
        getOptionLabel={(option: string) => removeExtraEmojiName(option).trim()}
        renderOption={(props, option: string) => {
          const optionContent = removeExtraEmojiName(option).trim();
          const emojiWrap = <>{emojiView(option)}</>;
          return (
            <Tooltip
              title={
                <EmojiWrap>
                  {emojiWrap}
                  {optionContent}
                </EmojiWrap>
              }
              placement='right'
              followCursor
            >
              <Box component='li' {...props} key={option} aria-label={'single-option'}>
                <EmojiWrap>
                  {emojiWrap}
                  <ListItemText primary={optionContent} />
                </EmojiWrap>
              </Box>
            </Tooltip>
          );
        }}
        value={value}
        onChange={(event, newValue: string) => onUpDatePipeline(newValue)}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField aria-label={'Pipeline Selector Text'} required {...params} label={label} variant='standard' />
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
