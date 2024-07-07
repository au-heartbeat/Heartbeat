import styled from '@emotion/styled';
import { theme } from '@src/theme';

export const PopperContentWrapper = styled.div({
  width: '24rem',
  margin: '2rem 0 0',
  padding: '1.5rem',
  boxShadow: theme.main.cardShadow,
  border: theme.main.cardBorder,
  background: 'white',
  borderRadius: '0.75rem',
});

export const PopperTitle = styled.p({
  fontWeight: 'bold',
  fontSize: '1rem',
});

export const PopperSubTitle = styled.p({
  fontSize: '0.625rem',
  lineHeight: '1.25rem',
  color: theme.main.errorMessage.color,
});

export const PopperNotes = styled.p({
  fontSize: '0.75rem',
  color: theme.main.note,
  lineHeight: '1.25rem',
});

export const LinkIconWrapper = styled.span({
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  marginRight: '0.625rem',
  '> svg': {
    fontSize: '1.5rem',
    color: 'white',
    transform: 'rotate(135deg)',
  },
});

export const LinkLine = styled.div({
  display: 'flex',
  alignItems: 'center',
  margin: '1.5rem 0',
  a: {
    cursor: 'pointer',
    marginRight: '0.625rem',
  },
  '.css-svzhua-MuiPaper-root-MuiAlert-root': {
    padding: '0rem 0.625rem',
  },
});

export const TrendContainer = styled('div')(({ color }: { color: string }) => ({
  display: 'flex',
  alignItems: 'center',
  color: color,
  margin: '0 0.5rem',
  fontSize: '1.125rem',
  '&:hover': {
    cursor: 'pointer',
  },
}));

export const ShareIconWrapper = styled.span(({ disabled }: { disabled: boolean }) => ({
  padding: '0.5rem',
  cursor: disabled ? 'unset !important' : 'pointer',
  marginLeft: '0.2rem',
  '> svg': {
    color: disabled ? theme.main.errorMessage.color : 'white',
  },
}));
