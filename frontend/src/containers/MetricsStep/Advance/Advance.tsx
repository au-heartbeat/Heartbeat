import { ItemCheckbox, StyledTooltip, TitleAndTooltipContainer, TooltipContainer } from '../CycleTime/style';
import { selectAdvancedSettings, updateAdvancedSettings } from '@src/context/Metrics/metricsSlice';
import { AdvancedContainer, AdvancedForm, AdvancedTitleContainer } from './style';
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
      value: advancedSettings?.storyPoint ?? '',
      validatedError: '',
      verifiedError: '',
      col: 2,
    },
    {
      key: 'Flag',
      value: advancedSettings?.flag ?? '',
      validatedError: '',
      verifiedError: '',
      col: 2,
    },
  ]);

  const toggleAdvancedSettings = () => {
    const newFields = fields.map((field) => ({
      ...field,
      value: '',
    }));
    setFields(newFields);
    const newAdvancedStettings = advancedSettings ? null : { storyPoints: '', flag: '' };
    dispatch(updateAdvancedSettings(newAdvancedStettings));
  };

  function getAdvancedSettings(fields: Field[]) {
    const storyPoint = fields.find((item) => item.key === 'Story Point')?.value;
    const flag = fields.find((item) => item.key === 'Flag')?.value;
    return { storyPoint, flag };
  }

  const handleUpdate = (fields: Field[]) => {
    setFields(fields);
    dispatch(updateAdvancedSettings(getAdvancedSettings(fields)));
  };

  const updateField = (key: string, value: string) => {
    const newFields = fields.map((field) =>
      field.key === key
        ? {
            ...field,
            value: value.trim(),
          }
        : field,
    );
    handleUpdate(newFields);
  };

  return (
    <>
      <AdvancedContainer onClick={toggleAdvancedSettings}>
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

      {advancedSettings && (
        <AdvancedForm>
          {fields.map(({ key, col, value }, index) => (
            <TextField
              id='standard-basic'
              variant='standard'
              sx={{ gridColumn: `span ${col}` }}
              key={index}
              label={key}
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
            />
          ))}
        </AdvancedForm>
      )}
    </>
  );
};
