import {
  ItemCheckbox,
  StyledTooltip,
  TitleAndTooltipContainer,
  TooltipContainer
} from '../CycleTime/style';
import { selectTreatFlagCardAsBlock, updateTreatFlagCardAsBlock } from '@src/context/Metrics/metricsSlice';
import { AdvancedContainer, AdvancedForm, AdvancedTitleContainer } from './style';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Link, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Field } from '@src/hooks/useVerifyBoardEffect';
import { TIPS } from '@src/constants/resources';
import { useState } from 'react';

export const Advance = () => {
  const dispatch = useAppDispatch();
  const flagCardAsBlock = useAppSelector(selectTreatFlagCardAsBlock);

  const handleFlagCardAsBlock = () => {
    dispatch(updateTreatFlagCardAsBlock(!flagCardAsBlock));
  };

  const [fields, setFields] = useState<Field[]>([
    {
      key: 'Story Point',
      value: '',
      validatedError: '',
      verifiedError: '',
      col: 2,
    },
    {
      key: 'Flag',
      value: '',
      validatedError: '',
      verifiedError: '',
      col: 2,
    },
  ]);

  return (
    <>
      <AdvancedContainer onClick={handleFlagCardAsBlock}>
        <ItemCheckbox checked={flagCardAsBlock} />
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
        {fields.map(({ key, col }, index) => (
          <TextField
            id='standard-basic'
            variant='standard'
            sx={{ gridColumn: `span ${col}` }}
            key={index}
            label={key}
          />
        ))}
      </AdvancedForm>
    </>
  );
};
