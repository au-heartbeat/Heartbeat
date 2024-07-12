import styled from '@emotion/styled';
import { theme } from '@src/theme';

export const ErrorContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6rem 0',
  maxWidth: '45rem',
  [theme.breakpoints.down('lg')]: {
    padding: '3rem 0',
    maxWidth: 'auto',
  },
});

export const ErrorTitle = styled.p({
  fontSize: '2.25rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
});

export const ErrorImg = styled.img({
  width: '25rem',
  [theme.breakpoints.down('lg')]: {
    width: '22rem',
  },
});

export const ErrorMessage = styled.p({
  marginTop: '1.5rem',
  fontSize: '1.5rem',
});
