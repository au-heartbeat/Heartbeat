import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const NewFunctionsContent = styled('div')({
  display: 'flex',
  gap: '1rem',
  [theme.breakpoints.down('md')]: {
    gap: '0.2rem',
  },
});

export const NewLabel = styled('div')({
  padding: '0 0.3rem',
  fontSize: '1rem',
  height: '1.5rem',
  lineHeight: '1.5rem',
  color: theme.components?.newFunctionsLabel.color,
  backgroundColor: theme.components?.newFunctionsLabel.backgroundColor,
});

export const NewLabelWithCustomizeMarginAndHeight = styled(NewLabel)({
  margin: '1rem 0 0',
  height: '2rem',
  lineHeight: '2rem',
});
