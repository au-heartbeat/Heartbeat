import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const NewFunctionsContent = styled('div')({
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    gap: '0.2rem',
  },
});

export const NewLabel = styled('div')({
  padding: '0 0.3rem',
  fontSize: '0.7rem',
  height: '1rem',
  lineHeight: '1rem',
  color: theme.components?.newFunctionsLabel.color,
  backgroundColor: theme.components?.newFunctionsLabel.backgroundColor,
});

export const NewLabelWithCustomizeMarginAndHeight = styled(NewLabel)({
  margin: '1.25rem 0 0',
});
