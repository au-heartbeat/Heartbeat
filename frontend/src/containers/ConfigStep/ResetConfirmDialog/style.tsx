import { styled } from '@mui/material/styles';
import { DialogContent } from '@mui/material';

export const ResetConfirmDialogButtonGroup = styled('div')({
  display: 'flex',
  width: '100%',
  justifyContent: 'end',
  margin: '3rem 0 0',
});

export const ResetConfirmDialogContent = styled(DialogContent)({
  fontSize: '1.2rem',
});

export const ResetConfirmDialogTitle = styled('div')({
  width: '100%',
  position: 'relative',
  fontSize: '1.125rem',
  textAlign: 'center',
  marginBottom: '3rem',
});
