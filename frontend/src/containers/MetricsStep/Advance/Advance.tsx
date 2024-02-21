import { ItemCheckbox, StyledTooltip, TitleAndTooltipContainer, TooltipContainer } from '../CycleTime/style';
import { selectTreatFlagCardAsBlock, updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';
import { AdvancedContainer, AdvancedForm, AdvancedTitleContainer } from './style';
import { selectAdvancedSettings } from '@src/context/Metrics/metricsSlice';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Link, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Field } from '@src/hooks/useVerifyBoardEffect';
import { TIPS } from '@src/constants/resources';
import { useState } from 'react';

export const Advance = () => {
  const dispatch = useAppDispatch();
  const advancedSettings = useAppSelector(selectAdvancedSettings);
  const [fields, setFields] = useState<Field[]>([
    {
      key: 'Story Point',
      value: advancedSettings.storyPoint,
      validatedError: '',
      verifiedError: '',
      col: 2,
    },
    {
      key: 'Flag',
      value: advancedSettings.flag,
      validatedError: '',
      verifiedError: '',
      col: 2,
    },
  ]);

  const handleAdvancedSettings = () => {
    // dispatch(updateTreatFlagCardAsBlock(!flagCardAsBlock));
    dispatch(updateAdvancedSettings(!flagCardAsBlock));
  };

  return (
    <>
      <AdvancedContainer onClick={handleAdvancedSettings}>
        <ItemCheckbox checked={!!advancedSettings} />
        <TitleAndTooltipContainer>
          <AdvancedTitleContainer>Advanced settings</AdvancedTitleContainer>
          <TooltipContainer data-test-id={'tooltip'}>
            <StyledTooltip arrow title={TIPS.ADVANCE} placement='top-start'>
              <IconButton aria-label='info'>
                <InfoOutlinedIcon />
              </IconButton>
            </StyledTooltip>
          </TooltipContainer>
          <Link href='#' underline='none'>
            how to set up?
          </Link>
        </TitleAndTooltipContainer>
      </AdvancedContainer>

      <AdvancedForm>
        {fields.map(({ key, col, value }, index) => (
          <TextField
            id='standard-basic'
            variant='standard'
            sx={{ gridColumn: `span ${col}` }}
            key={index}
            label={key}
            value={value}
          />
        ))}
      </AdvancedForm>
    </>
  );
};
