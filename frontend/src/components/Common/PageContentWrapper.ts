import { styled } from '@mui/material';
import { theme } from '@src/theme';

export const PageContentWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '70%',
  minWidth: theme.main.contentMinWidth,
  maxWidth: theme.main.contentMaxWidth,
  margin: '0 auto',
  textAlign: 'left',
  [theme.breakpoints.down('lg')]: {
    width: 'auto',
    margin: '0 1.25rem',
    minWidth: 'auto',
  },
});
