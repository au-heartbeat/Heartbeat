import { styled } from '@mui/material';
import { theme } from '@src/theme';

export const FormGroupWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  border: theme.main.cardBorder,
  boxShadow: 'none',
  marginBottom: '1rem',
  lineHeight: '2rem',
  borderRadius: '0.25rem',
  padding: '2.5%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});
