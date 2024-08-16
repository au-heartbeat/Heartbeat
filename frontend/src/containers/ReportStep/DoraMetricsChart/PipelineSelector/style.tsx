import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';

export const PipelinesSelectContainer = styled('div')({
  margin: '1rem 0 0',
  display: 'flex',
  alignItems: 'flex-start',
  width: '50%',
  lineHeight: '2rem',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: '7rem',
  },
});
